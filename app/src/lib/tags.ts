import type { ContentEntry } from './types';

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function tagToSlug(tag: string): string {
  return normalizeTag(tag).replace(/\s+/g, '-');
}

export function slugToTag(slug: string): string {
  return slug.replace(/-/g, ' ');
}

export function collectTags(entries: ContentEntry[]): string[] {
  const set = new Set<string>();
  for (const entry of entries) {
    for (const tag of entry.tags ?? []) set.add(normalizeTag(tag));
  }
  return [...set].sort();
}
