import type { APIRoute } from 'astro';

export const prerender = false;

type KashmirInsights = {
    summary: string;
    difficulty: string;
    risksAnalysis: string;
    pacing: string;
    decisionPoints: string;
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

function parseInsights(rawText: string): KashmirInsights {
    const trimmed = rawText.trim();
    const candidate = trimmed.match(/\{[\s\S]*\}/)?.[0] ?? trimmed;
    let parsed: Partial<KashmirInsights> = {};

    try {
        parsed = JSON.parse(candidate);
    } catch (e) {
        console.warn('Failed to parse AI output as JSON. Raw text:', rawText);
    }

    return {
        summary: parsed.summary ?? 'No summary available.',
        difficulty: parsed.difficulty ?? 'Not specified.',
        risksAnalysis: parsed.risksAnalysis ?? 'Not specified.',
        pacing: parsed.pacing ?? 'Not specified.',
        decisionPoints: parsed.decisionPoints ?? 'Not specified.',
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

    const systemPrompt = `You are an expert adventure motorcycle (ADV) situational awareness guide for high-altitude expeditions in Kashmir and Ladakh.
Your goal is to provide deeply grounded, practical, and highly cautious contextual interpretation for specific route sections or points of interest.
DO NOT provide exact turn-by-turn navigation or guarantee safety.
Instead, interpret difficulty, brutally explain risks (weather, altitude, political drops), suggest pacing and hydration/acclimatization checks, and highlight critical decision points.

Respond ONLY with a valid JSON object matching this structure:
{
  "summary": "Interpretative high-level summary of what this segment truly entails.",
  "difficulty": "Frank difficulty interpretation (mental and physical).",
  "risksAnalysis": "Breakdown of altitude, weather volatility, and political/military presence.",
  "pacing": "Pacing suggestions, optimal time of day to ride, and acclimatization.",
  "decisionPoints": "Critical junctions, where to turn around if conditions worsen, or where to stock fuel."
}`;

    const userPrompt = `Please analyze the following Kashmir/Ladakh ADV expedition location or section and provide the structured JSON situational awareness interpretation: ${context}`;

    const model = import.meta.env.OPENAI_MODEL || 'gpt-4.1-mini';

    const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            temperature: 0.3,
            max_output_tokens: 1500,
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
        console.error('[generate-kashmir] Failed to parse model output:', error);
        return new Response(JSON.stringify({
            error: 'Model response was not valid JSON.',
            rawText
        }), { status: 502 });
    }
};
