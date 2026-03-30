import type { ContentEntry } from './types';

export const OLMSTED_ESSAY_SLUG = 'project-olmsted';

export function byPublishedDateDesc(a: Pick<ContentEntry, 'publishedAt'>, b: Pick<ContentEntry, 'publishedAt'>): number {
  return a.publishedAt < b.publishedAt ? 1 : -1;
}

export function prioritizeOlmstedEssay<T extends Pick<ContentEntry, 'slug'>>(entries: T[]): T[] {
  const priority = entries.find((entry) => entry.slug === OLMSTED_ESSAY_SLUG);
  if (!priority) return entries;
  return [priority, ...entries.filter((entry) => entry.slug !== OLMSTED_ESSAY_SLUG)];
}

export function applyEssayDisplayOverrides(entry: ContentEntry): ContentEntry {
  return entry;
}
