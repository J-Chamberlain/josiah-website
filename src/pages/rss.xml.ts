import rss from '@astrojs/rss';
import { SITE_SETTINGS } from '../lib/site';
import { getAllPublicContent } from '../lib/content-source';
import { toRssItems } from '../lib/feeds';

export const prerender = true;

export async function GET(context: { site: URL | undefined }) {
  const entries = await getAllPublicContent();
  return rss({
    title: SITE_SETTINGS.siteTitle,
    description: SITE_SETTINGS.siteDescription,
    site: context.site ?? import.meta.env.PUBLIC_SITE_URL ?? 'https://example.com',
    items: toRssItems(entries),
  });
}
