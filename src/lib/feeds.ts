import type { ContentEntry } from './types';

export function toRssItems(entries: ContentEntry[]) {
  return entries
    .filter((entry) => entry.visibility === 'public')
    .map((entry) => ({
      title: entry.title,
      description: entry.excerpt,
      pubDate: new Date(entry.publishedAt),
      link: `/${kindPath(entry.kind)}/${entry.slug}`,
    }));
}

function kindPath(kind: ContentEntry['kind']): string {
  if (kind === 'ideaOutline') return 'ideas';
  return `${kind}s`;
}
