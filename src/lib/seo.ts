import { SITE_SETTINGS } from './site';

export type SeoInput = {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noindex?: boolean;
};

export function buildSeo({
  title,
  description,
  path = '/',
  ogImage = SITE_SETTINGS.defaultOgImage,
  noindex = false,
}: SeoInput) {
  const base = (import.meta.env.PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, '');
  const canonical = `${base}${path}`;
  const ogUrl = ogImage.startsWith('http') ? ogImage : `${base}${ogImage}`;

  return {
    canonical,
    title,
    description,
    ogImage: ogUrl,
    noindex,
  };
}
