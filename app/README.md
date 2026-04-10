# Website App

## Local Setup

1. Install dependencies: `npm install`
2. Copy envs: `cp .env.example .env`
3. Set `OPENAI_API_KEY` to a server-side API key.
4. Optionally override models with `OPENAI_MODEL`, `OPENAI_HISTORY_MODEL`, `OPENAI_KASHMIR_MODEL`, and `OPENAI_COBDR_MODEL`.
5. Start dev server: `npm run dev`

## GPT-backed Pages

- `/history-explorer` calls `/api/generate-history`
- `/kashmir` calls `/api/generate-kashmir`
- `/cobdr` calls `/api/generate-cobdr`

These endpoints run server-side and read `OPENAI_API_KEY` from `import.meta.env`, so the key must exist in local `.env` and in the deployment environment.

## Verification

- Run `npm run verify:integrations` to confirm configured services are reachable.
- The OpenAI check calls the Responses API using your configured model envs and reports whether the request succeeds.

## Commands

- `npm run dev`: start local Astro dev server
- `npm run build`: production build
- `npm run preview`: preview production build locally
- `npm run verify:integrations`: verify Sanity, Supabase, Resend, OpenAI, and DNS configuration
