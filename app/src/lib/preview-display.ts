import type { ContentEntry } from './types';

export const OLMSTED_ESSAY_SLUG = 'project-olmsted';

const essayPlaceholderCopyBySlug: Record<string, { title: string; excerpt: string }> = {
  'test-essay': {
    title: 'Placeholder Essay',
    excerpt: 'This entry is a temporary placeholder while the site is being developed.',
  },
  'second-essay': {
    title: 'Draft Essay (Placeholder)',
    excerpt: 'Additional essays will appear here as the project develops.',
  },
};

export function byPublishedDateDesc(a: Pick<ContentEntry, 'publishedAt'>, b: Pick<ContentEntry, 'publishedAt'>): number {
  return a.publishedAt < b.publishedAt ? 1 : -1;
}

export function prioritizeOlmstedEssay<T extends Pick<ContentEntry, 'slug'>>(entries: T[]): T[] {
  const priority = entries.find((entry) => entry.slug === OLMSTED_ESSAY_SLUG);
  if (!priority) return entries;
  return [priority, ...entries.filter((entry) => entry.slug !== OLMSTED_ESSAY_SLUG)];
}

export function applyEssayDisplayOverrides(entry: ContentEntry): ContentEntry {
  if (entry.kind !== 'essay') return entry;
  const copy = essayPlaceholderCopyBySlug[entry.slug];
  if (!copy) return entry;
  return {
    ...entry,
    title: copy.title,
    excerpt: copy.excerpt,
  };
}
