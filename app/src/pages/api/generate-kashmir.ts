import type { APIRoute } from 'astro';

export const prerender = false;

const OPENAI_API_BASE = 'https://api.openai.com/v1';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';

type KashmirInsights = {
  summary: string;
  difficulty: string;
  risksAnalysis: string;
  pacing: string;
  decisionPoints: string;
};

type ErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function jsonError(code: string, message: string, status: number, details?: unknown) {
  return jsonResponse({
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  }, status);
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: 'UnknownError',
    message: typeof error === 'string' ? error : 'Unknown error',
    stack: undefined,
  };
}

function getOpenAIApiKey(env: ImportMetaEnv) {
  return env.OPENAI_API_KEY?.trim() || null;
}

function getOpenAIModel(env: ImportMetaEnv) {
  return env.OPENAI_KASHMIR_MODEL?.trim() || env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

async function requestOpenAIResponse(
  env: ImportMetaEnv,
  {
    systemPrompt,
    userPrompt,
    maxOutputTokens,
    temperature = 0.3,
  }: {
    systemPrompt: string;
    userPrompt: string;
    maxOutputTokens: number;
    temperature?: number;
  },
) {
  const apiKey = getOpenAIApiKey(env);

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const model = getOpenAIModel(env);

  const response = await fetch(`${OPENAI_API_BASE}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      max_output_tokens: maxOutputTokens,
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

  return { model, response };
}

function extractOpenAIOutputText(payload: Record<string, unknown>) {
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
  const parsed = JSON.parse(candidate) as Partial<KashmirInsights>;

  return {
    summary: parsed.summary ?? 'No summary available.',
    difficulty: parsed.difficulty ?? 'Not specified.',
    risksAnalysis: parsed.risksAnalysis ?? 'Not specified.',
    pacing: parsed.pacing ?? 'Not specified.',
    decisionPoints: parsed.decisionPoints ?? 'Not specified.',
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('[generate-kashmir] request entry', {
      method: request.method,
      contentType: request.headers.get('content-type'),
      contentLength: request.headers.get('content-length'),
    });

    const apiKey = getOpenAIApiKey(import.meta.env);
    const model = getOpenAIModel(import.meta.env);

    console.log('[generate-kashmir] env var presence checks', {
      hasOpenAIApiKey: Boolean(apiKey),
      hasOpenAIModel: Boolean(import.meta.env.OPENAI_MODEL?.trim()),
      hasOpenAIKashmirModel: Boolean(import.meta.env.OPENAI_KASHMIR_MODEL?.trim()),
    });

    if (!apiKey) {
      console.error('[generate-kashmir] missing env var', {
        requiredEnvVar: 'OPENAI_API_KEY',
      });
      return jsonError('missing_env_var', 'OPENAI_API_KEY is not configured.', 500, {
        expectedEnvVars: ['OPENAI_API_KEY', 'OPENAI_MODEL', 'OPENAI_KASHMIR_MODEL'],
      });
    }

    if (!model || !model.trim()) {
      console.error('[generate-kashmir] model config error', {
        openAIModel: import.meta.env.OPENAI_MODEL,
        openAIKashmirModel: import.meta.env.OPENAI_KASHMIR_MODEL,
      });
      return jsonError('model_config_error', 'No OpenAI model could be resolved for the Kashmir route.', 500, {
        expectedEnvVars: ['OPENAI_MODEL', 'OPENAI_KASHMIR_MODEL'],
      });
    }

    let payload: unknown;
    try {
      payload = await request.json();
      console.log('[generate-kashmir] request body parsing succeeded', {
        payloadType: typeof payload,
        hasContext: Boolean(payload && typeof payload === 'object' && 'context' in payload),
      });
    } catch (error) {
      console.error('[generate-kashmir] request body parsing failed', serializeError(error));
      return jsonError('invalid_json', 'Expected a valid JSON request body.', 400);
    }

    const context =
      payload && typeof payload === 'object' && 'context' in payload
        ? (payload as { context?: unknown }).context
        : undefined;

    if (typeof context !== 'string' || !context.trim()) {
      console.error('[generate-kashmir] validation failed', {
        receivedContextType: typeof context,
        hasContextValue: Boolean(typeof context === 'string' && context.trim()),
      });
      return jsonError('invalid_request_body', 'Request body must include a non-empty string `context` field.', 400, {
        requiredFields: ['context'],
      });
    }

    console.log('[generate-kashmir] validation passed', {
      contextLength: context.length,
      contextPreview: context.slice(0, 120),
    });

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

    console.log('[generate-kashmir] model selection', {
      feature: 'kashmir',
      model,
    });

    console.log('[generate-kashmir] right before OpenAI call', {
      model,
      maxOutputTokens: 1500,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
    });

    const { response: openAIResponse } = await requestOpenAIResponse(import.meta.env, {
      systemPrompt,
      userPrompt,
      maxOutputTokens: 1500,
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('[generate-kashmir] OpenAI request failed', {
        status: openAIResponse.status,
        errorText,
      });
      return jsonError('openai_request_failed', 'OpenAI request failed.', 502, {
        status: openAIResponse.status,
        errorText,
        model,
      });
    }

    const completion = await openAIResponse.json() as Record<string, unknown>;
    const rawText = extractOpenAIOutputText(completion);

    try {
      const insights = parseInsights(rawText);
      return jsonResponse({ insights }, 200);
    } catch (error) {
      console.error('[generate-kashmir] model response parsing failed', {
        ...serializeError(error),
        rawText,
      });
      return jsonError('invalid_model_response', 'Model response was not valid JSON.', 502, {
        rawText,
        model,
      });
    }
  } catch (error) {
    const serializedError = serializeError(error);
    console.error('[generate-kashmir] catch block', serializedError);
    return jsonError('internal_error', serializedError.message, 500, {
      name: serializedError.name,
    });
  }
};
