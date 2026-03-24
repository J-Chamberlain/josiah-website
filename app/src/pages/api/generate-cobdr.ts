import type { APIRoute } from 'astro';

export const prerender = false;

type CobdrInsights = {
    summary: string;
    difficulty: string;
    terrain: string;
    altitudeConsiderations: string;
    logistics: string;
};

function extractOutputText(payload: Record<string, unknown>) {
    if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
        return payload.output_text;
    }

    if (!Array.isArray(payload.output)) return '';

    return payload.output
        .flatMap((item) => {
            if (!item || typeof item !== 'object' || !('content' in item)) return [];
            const content = (item as { content?: unknown }).content;
            if (!Array.isArray(content)) return [];
            return content
                .map((entry) => {
                    if (!entry || typeof entry !== 'object') return '';
                    if ('text' in entry && typeof entry.text === 'string') return entry.text;
                    return '';
                })
                .filter(Boolean);
        })
        .join('\n');
}

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
    const apiKey = import.meta.env.OPENAI_API_KEY;

    if (!apiKey) {
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

    const model = import.meta.env.OPENAI_MODEL || 'gpt-4.1-mini';

    // Following the exact fetch pattern from generate-history.ts
    const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            temperature: 0.3,
            max_output_tokens: 1400,
            input: [
                {
                    role: 'system',
                    content: [{ type: 'input_text', text: systemPrompt }],
                },
                {
                    role: 'user',
                    content: [{ type: 'input_text', text: userPrompt }],
                },
            ],
        }),
    });

    if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        return new Response(
            JSON.stringify({ error: `AI request failed: ${openAIResponse.status} ${errorText}` }),
            { status: 502 },
        );
    }

    const completion = await openAIResponse.json() as Record<string, unknown>;
    const rawText = extractOutputText(completion);

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
