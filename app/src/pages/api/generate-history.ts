import type { APIRoute } from 'astro';
import { z } from 'zod';
import { buildHistoryPrompt } from '../../components/HistoryExplorer/historyPrompt';
import {
  classifySelection,
  clampSelection,
  estimateRegionBands,
  estimateTimeRange,
  type SelectionRect,
} from '../../components/HistoryExplorer/selectionClassifier';

export const prerender = false;

const selectionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().positive().max(1),
  height: z.number().positive().max(1),
});

const requestSchema = z.object({
  selection: selectionSchema,
  image: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    src: z.string().optional(),
  }),
});

type HistoryNarrative = {
  summary: string;
  cultures: {
    dominant: string | null;
    included: string[];
    note: string;
  };
  historicalContext: string;
  keyFigures: string[];
  majorDevelopments: {
    political: string[];
    technological: string[];
    cultural: string[];
    economic: string[];
  };
  whyItMatters: string;
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

function parseNarrative(rawText: string): HistoryNarrative {
  const trimmed = rawText.trim();
  const candidate = trimmed.match(/\{[\s\S]*\}/)?.[0] ?? trimmed;
  const parsed = JSON.parse(candidate) as Partial<HistoryNarrative>;

  return {
    summary: parsed.summary ?? 'No summary returned.',
    cultures: {
      dominant: parsed.cultures?.dominant ?? null,
      included: parsed.cultures?.included ?? [],
      note: parsed.cultures?.note ?? 'This interpretation is approximate and based on inferred chart coordinates.',
    },
    historicalContext: parsed.historicalContext ?? 'No historical context returned.',
    keyFigures: parsed.keyFigures ?? [],
    majorDevelopments: {
      political: parsed.majorDevelopments?.political ?? [],
      technological: parsed.majorDevelopments?.technological ?? [],
      cultural: parsed.majorDevelopments?.cultural ?? [],
      economic: parsed.majorDevelopments?.economic ?? [],
    },
    whyItMatters: parsed.whyItMatters ?? 'No significance analysis returned.',
  };
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not configured.' }), { status: 500 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Expected JSON payload.' }), { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid selection payload.' }), { status: 400 });
  }

  const normalizedSelection: SelectionRect = clampSelection(parsed.data.selection);
  const mode = classifySelection(normalizedSelection);
  const timeRange = estimateTimeRange(normalizedSelection);
  const regionEstimate = estimateRegionBands(normalizedSelection);
  const prompts = buildHistoryPrompt({
    mode,
    normalizedRect: normalizedSelection,
    timeRange,
    intersectedBands: regionEstimate.intersectedBands,
    dominantBand: regionEstimate.dominantBand,
    selectionWidth: normalizedSelection.width,
    selectionHeight: normalizedSelection.height,
  });

  const model = import.meta.env.OPENAI_HISTORY_MODEL || import.meta.env.OPENAI_MODEL || 'gpt-4.1-mini';

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
          content: [{ type: 'input_text', text: prompts.systemPrompt }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: prompts.userPrompt }],
        },
      ],
    }),
  });

  if (!openAIResponse.ok) {
    const errorText = await openAIResponse.text();
    return new Response(
      JSON.stringify({ error: `OpenAI request failed: ${openAIResponse.status} ${errorText}` }),
      { status: 502 },
    );
  }

  const completion = await openAIResponse.json() as Record<string, unknown>;
  const rawText = extractOutputText(completion);

  try {
    const narrative = parseNarrative(rawText);

    return new Response(JSON.stringify({
      mode,
      timeRange,
      regionEstimate,
      narrative,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[generate-history] Failed to parse model output:', error);
    return new Response(JSON.stringify({
      error: 'Model response was not valid JSON.',
      rawText,
      mode,
      timeRange,
      regionEstimate,
    }), { status: 502 });
  }
};
