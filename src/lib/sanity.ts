import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = import.meta.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET;
const apiVersion = import.meta.env.SANITY_API_VERSION || '2025-01-01';
const token = import.meta.env.SANITY_READ_TOKEN;
const sanityFetchTimeoutMs = Number(import.meta.env.SANITY_FETCH_TIMEOUT_MS || 4000);

export const hasSanityConfig = Boolean(projectId && dataset);

export const sanityClient = hasSanityConfig
  ? createClient({ projectId, dataset, apiVersion, token, useCdn: true })
  : null;

export const urlFor = hasSanityConfig && sanityClient ? imageUrlBuilder(sanityClient) : null;

export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  if (!sanityClient) return null;

  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), sanityFetchTimeoutMs);
  });

  const fetchPromise = sanityClient
    .fetch<T>(query, params)
    .then((value) => value ?? null)
    .catch((error) => {
      console.warn('[sanity] fetch failed, falling back to local content:', error);
      return null;
    });

  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch {
    return null;
  }
}

export const queries = {
  publicByKind: `*[_type == $type && status == "published" && visibility != "unlisted"] | order(publishedAt desc)`,
  publicBySlug: `*[_type == $type && slug.current == $slug && status == "published" && visibility != "unlisted"][0]`,
  siteSettings: `*[_type == "siteSettings"][0]`,
};
