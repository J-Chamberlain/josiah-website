const OPENAI_API_BASE = 'https://api.openai.com/v1';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';

type OpenAIModelFeature = 'history' | 'kashmir' | 'cobdr';

type OpenAIResponseRequest = {
  feature: OpenAIModelFeature;
  systemPrompt: string;
  userPrompt: string;
  maxOutputTokens: number;
  temperature?: number;
};

export function getOpenAIApiKey(env: ImportMetaEnv) {
  return env.OPENAI_API_KEY?.trim() || null;
}

export function getOpenAIModel(env: ImportMetaEnv, feature: OpenAIModelFeature) {
  const featureModel =
    feature === 'history'
      ? env.OPENAI_HISTORY_MODEL
      : feature === 'kashmir'
        ? env.OPENAI_KASHMIR_MODEL
        : env.OPENAI_COBDR_MODEL;

  return featureModel?.trim() || env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

export async function requestOpenAIResponse(
  env: ImportMetaEnv,
  { feature, systemPrompt, userPrompt, maxOutputTokens, temperature = 0.3 }: OpenAIResponseRequest,
) {
  const apiKey = getOpenAIApiKey(env);

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const model = getOpenAIModel(env, feature);

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

export function extractOpenAIOutputText(payload: Record<string, unknown>) {
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
