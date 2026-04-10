import type { APIRoute } from 'astro';
import { z } from 'zod';
import { buildHistoryPrompt } from '../../components/HistoryExplorer/historyPrompt';
import {
  extractOpenAIOutputText,
  getOpenAIApiKey,
  getOpenAIModel,
  requestOpenAIResponse,
} from '../../lib/openai';
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

function summarizeValidationIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
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
  try {
    console.log('[generate-history] request entry', {
      method: request.method,
      contentType: request.headers.get('content-type'),
      contentLength: request.headers.get('content-length'),
    });

    const apiKey = getOpenAIApiKey(import.meta.env);
    const model = getOpenAIModel(import.meta.env, 'history');

    console.log('[generate-history] env var presence checks', {
      hasOpenAIApiKey: Boolean(apiKey),
      hasOpenAIModel: Boolean(import.meta.env.OPENAI_MODEL?.trim()),
      hasOpenAIHistoryModel: Boolean(import.meta.env.OPENAI_HISTORY_MODEL?.trim()),
    });

    if (!apiKey) {
      console.error('[generate-history] missing env var', {
        requiredEnvVar: 'OPENAI_API_KEY',
      });
      return jsonError('missing_env_var', 'OPENAI_API_KEY is not configured.', 500, {
        expectedEnvVars: ['OPENAI_API_KEY', 'OPENAI_MODEL', 'OPENAI_HISTORY_MODEL'],
      });
    }

    if (!model || !model.trim()) {
      console.error('[generate-history] model config error', {
        openAIModel: import.meta.env.OPENAI_MODEL,
        openAIHistoryModel: import.meta.env.OPENAI_HISTORY_MODEL,
      });
      return jsonError('model_config_error', 'No OpenAI model could be resolved for the history route.', 500, {
        expectedEnvVars: ['OPENAI_MODEL', 'OPENAI_HISTORY_MODEL'],
      });
    }

    let payload: unknown;

    try {
      payload = await request.json();
      console.log('[generate-history] request body parsing succeeded', {
        payloadType: typeof payload,
        hasSelection: Boolean(payload && typeof payload === 'object' && 'selection' in payload),
        hasImage: Boolean(payload && typeof payload === 'object' && 'image' in payload),
      });
    } catch (error) {
      console.error('[generate-history] request body parsing failed', serializeError(error));
      return jsonError('invalid_json', 'Expected a valid JSON request body.', 400);
    }

    const parsed = requestSchema.safeParse(payload);
    if (!parsed.success) {
      const issues = summarizeValidationIssues(parsed.error.issues);
      console.error('[generate-history] required field validation failed', { issues });
      return jsonError('invalid_request_body', 'Request body did not match the expected schema.', 400, {
        requiredFields: ['selection.x', 'selection.y', 'selection.width', 'selection.height', 'image.width', 'image.height'],
        issues,
      });
    }

    console.log('[generate-history] required field validation passed', {
      selection: parsed.data.selection,
      image: parsed.data.image,
    });

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

    console.log('[generate-history] model selection', {
      feature: 'history',
      model,
      mode,
      timeRange: timeRange.label,
      dominantBand: regionEstimate.dominantBand,
    });

    console.log('[generate-history] right before OpenAI call', {
      model,
      maxOutputTokens: 1400,
      systemPromptLength: prompts.systemPrompt.length,
      userPromptLength: prompts.userPrompt.length,
    });

    const { response: openAIResponse } = await requestOpenAIResponse(import.meta.env, {
      feature: 'history',
      systemPrompt: prompts.systemPrompt,
      userPrompt: prompts.userPrompt,
      maxOutputTokens: 1400,
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('[generate-history] OpenAI request failed', {
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
      const narrative = parseNarrative(rawText);

      return jsonResponse({
        mode,
        timeRange,
        regionEstimate,
        narrative,
      }, 200);
    } catch (error) {
      console.error('[generate-history] model response parsing failed', {
        ...serializeError(error),
        rawText,
      });
      return jsonError('invalid_model_response', 'Model response was not valid JSON.', 502, {
        rawText,
        mode,
        timeRange,
        regionEstimate,
      });
    }
  } catch (error) {
    const serializedError = serializeError(error);
    console.error('[generate-history] catch block', serializedError);
    return jsonError('internal_error', serializedError.message, 500, {
      name: serializedError.name,
    });
  }
};
