import type { APIRoute } from 'astro';
import { extractOpenAIOutputText, requestOpenAIResponse } from '../../lib/openai';

export const prerender = false;

type CobdrInsights = {
    summary: string;
    difficulty: string;
    terrain: string;
    altitudeConsiderations: string;
    logistics: string;
};

function parseInsights(rawText: string): CobdrInsights {
    const trimmed = rawText.trim();
    const candidate = trimmed.match(/\{[\s\S]*\}/)?.[0] ?? trimmed;
    let parsed: Partial<CobdrInsights> = {};

    try {
        parsed = JSON.parse(candidate);
    } catch (e) {
        console.warn('Failed to parse AI output as JSON. Raw text:', rawText);
    }

    return {
        summary: parsed.summary ?? 'No summary available.',
        difficulty: parsed.difficulty ?? 'Not specified.',
        terrain: parsed.terrain ?? 'Not specified.',
        altitudeConsiderations: parsed.altitudeConsiderations ?? 'Not specified.',
        logistics: parsed.logistics ?? 'Not specified.',
    };
}

export const POST: APIRoute = async ({ request }) => {
    if (!import.meta.env.OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not configured.' }), { status: 500 });
    }

    let payload: any;
    try {
        payload = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Expected JSON payload.' }), { status: 400 });
    }

    const { context } = payload;
    if (!context) {
        return new Response(JSON.stringify({ error: 'Missing context parameter.' }), { status: 400 });
    }

    const systemPrompt = `You are an expert backcountry off-roading guide and planning assistant for the Colorado Backcountry Discovery Route (COBDR).
Your goal is to provide insightful, accurate, and structured safety/logistics information for specific route sections or points of interest.
DO NOT provide turn-by-turn navigation or exact GPS guidance. Instead, explain what makes the section notable, describe the terrain, interpret altitude/passes, and summarize logistics.

Respond ONLY with a valid JSON object matching this structure:
{
  "summary": "High-level summary of what makes this section notable.",
  "difficulty": "General difficulty rating and explanation.",
  "terrain": "Description of the terrain, rutting, rocks, water crossings, etc.",
  "altitudeConsiderations": "Insights on passes, altitude sickness, and seasonality of snow.",
  "logistics": "Time, pacing, fuel availability, and general considerations."
}`;

    const userPrompt = `Please analyze the following COBDR location/section and provide the structured JSON insights: ${context}`;

    const { response: openAIResponse } = await requestOpenAIResponse(import.meta.env, {
        feature: 'cobdr',
        systemPrompt,
        userPrompt,
        maxOutputTokens: 1400,
    });

    if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        return new Response(
            JSON.stringify({ error: `AI request failed: ${openAIResponse.status} ${errorText}` }),
            { status: 502 },
        );
    }

    const completion = await openAIResponse.json() as Record<string, unknown>;
    const rawText = extractOpenAIOutputText(completion);

    try {
        const insights = parseInsights(rawText);
        return new Response(JSON.stringify({ insights }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('[generate-cobdr] Failed to parse model output:', error);
        return new Response(JSON.stringify({
            error: 'Model response was not valid JSON.',
            rawText
        }), { status: 502 });
    }
};
