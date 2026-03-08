import {
  getFeaturedProjects as getFeaturedProjectsLocal,
  getPublishedBySlug as getPublishedBySlugLocal,
  getPublicByKind as getPublicByKindLocal,
  getPublicBySlug as getPublicBySlugLocal,
  getPublicContent as getPublicContentLocal,
} from './content';
import { hasSanityConfig, sanityFetch, urlFor } from './sanity';
import { normalizeTag } from './tags';
import type { ContentEntry, ContentKind } from './types';

type SanityEntry = {
  _id: string;
  _type: ContentKind;
  title: string;
  slug?: string;
  excerpt?: string;
  publishedAt?: string;
  visibility?: 'public' | 'unlisted';
  tags?: string[];
  stage?: ContentEntry['ideaStage'];
  openQuestions?: string[];
  coverImage?: { asset?: unknown };
  body?: unknown[];
  overview?: unknown[];
  sections?: unknown[];
  images?: Array<{ src?: string; alt?: string; caption?: string; fullWidth?: boolean; image?: unknown }>;
};

const SANITY_SELECT = `{
  _id,
  _type,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  visibility,
  "tags": tags[]->name,
  "stage": stage,
  openQuestions,
  coverImage,
  body,
  overview,
  sections,
  images
}`;

function byDateDesc(a: ContentEntry, b: ContentEntry): number {
  return a.publishedAt < b.publishedAt ? 1 : -1;
}

function textFromPortableBlock(block: Record<string, unknown>): string {
  const children = Array.isArray(block.children) ? block.children : [];
  return children
    .map((child) => (typeof child === 'object' && child && 'text' in child ? String(child.text || '') : ''))
    .join('')
    .trim();
}

function imageUrlFrom(value: unknown): string | null {
  if (!urlFor || !value || typeof value !== 'object') return null;
  try {
    return urlFor.image(value).width(1800).auto('format').url();
  } catch {
    return null;
  }
}

function normalizeBlocks(entry: SanityEntry): ContentEntry['body'] {
  const sourceBlocks =
    entry._type === 'project'
      ? [...(entry.overview || []), ...(entry.sections || [])]
      : entry._type === 'gallery'
        ? entry.images || []
        : entry.body || [];

  const blocks: ContentEntry['body'] = [];

  for (const raw of sourceBlocks) {
    if (!raw || typeof raw !== 'object') continue;
    const block = raw as Record<string, unknown>;
    const type = String(block._type || '');

    if (type === 'block') {
      const text = textFromPortableBlock(block);
      if (text) blocks.push({ type: 'paragraph', text });
      continue;
    }

    if (type === 'mediaEmbed') {
      const provider = String(block.provider || '');
      const value = String(block.value || '');
      const title = String(block.title || 'Embedded media');
      if (provider === 'youtube' && value) {
        blocks.push({ type: 'youtube', id: value, title });
      } else if (provider === 'spotify' && value) {
        blocks.push({ type: 'spotify', url: value, title });
      }
      continue;
    }

    if (type === 'imageFigure') {
      const src = imageUrlFrom(block.image);
      const alt = String(block.alt || '');
      if (src && alt) {
        blocks.push({
          type: 'image',
          src,
          alt,
          caption: typeof block.caption === 'string' ? block.caption : undefined,
          fullWidth: Boolean(block.fullWidth),
        });
      }
      continue;
    }

    if (entry._type === 'gallery') {
      const src = typeof block.src === 'string' ? block.src : imageUrlFrom(block.image);
      const alt = String(block.alt || '');
      if (src && alt) {
        blocks.push({
          type: 'image',
          src,
          alt,
          caption: typeof block.caption === 'string' ? block.caption : undefined,
          fullWidth: Boolean(block.fullWidth),
        });
      }
    }
  }

  return blocks;
}

function mapSanityEntry(entry: SanityEntry): ContentEntry | null {
  const slug = entry.slug || '';
  if (!slug) return null;
  const kind = entry._type;
  const body = normalizeBlocks(entry);
  const excerpt = (entry.excerpt || '').trim() || (body.find((b) => b.type === 'paragraph')?.text ?? '');
  const coverSrc = imageUrlFrom(entry.coverImage);

  return {
    id: entry._id,
    kind,
    title: entry.title,
    slug,
    excerpt,
    publishedAt: entry.publishedAt || new Date().toISOString().slice(0, 10),
    visibility: entry.visibility === 'unlisted' ? 'unlisted' : 'public',
    tags: (entry.tags || []).filter(Boolean),
    coverImage: coverSrc ? { src: coverSrc, alt: entry.title } : undefined,
    body,
    ideaStage: entry.stage,
    openQuestions: entry.openQuestions || [],
  };
}

async function sanityByKind(kind: ContentKind): Promise<ContentEntry[] | null> {
  const rows = await sanityFetch<SanityEntry[]>(
    `*[_type == $kind && status == "published" && visibility != "unlisted"] | order(publishedAt desc) ${SANITY_SELECT}`,
    { kind },
  );
  if (!rows) return null;
  return rows.map(mapSanityEntry).filter((x): x is ContentEntry => Boolean(x));
}

async function sanityBySlug(kind: ContentKind, slug: string): Promise<ContentEntry | null> {
  const row = await sanityFetch<SanityEntry>(
    `*[_type == $kind && slug.current == $slug && status == "published" && visibility != "unlisted"][0] ${SANITY_SELECT}`,
    { kind, slug },
  );
  if (!row) return null;
  return mapSanityEntry(row);
}

async function sanityByPublishedSlug(kind: ContentKind, slug: string): Promise<ContentEntry | null> {
  const row = await sanityFetch<SanityEntry>(
    `*[_type == $kind && slug.current == $slug && status == "published"][0] ${SANITY_SELECT}`,
    { kind, slug },
  );
  if (!row) return null;
  return mapSanityEntry(row);
}

async function sanityAllPublic(): Promise<ContentEntry[] | null> {
  const rows = await sanityFetch<SanityEntry[]>(
    `*[_type in ["essay","project","ideaOutline","gallery"] && status == "published" && visibility != "unlisted"] | order(publishedAt desc) ${SANITY_SELECT}`,
  );
  if (!rows) return null;
  return rows.map(mapSanityEntry).filter((x): x is ContentEntry => Boolean(x)).sort(byDateDesc);
}

export async function getAllPublicContent(): Promise<ContentEntry[]> {
  if (!hasSanityConfig) return getPublicContentLocal();
  return (await sanityAllPublic()) || getPublicContentLocal();
}

export async function getPublicByKind(kind: ContentKind): Promise<ContentEntry[]> {
  if (!hasSanityConfig) return getPublicByKindLocal(kind);
  return (await sanityByKind(kind)) || getPublicByKindLocal(kind);
}

export async function getPublicBySlug(kind: ContentKind, slug: string): Promise<ContentEntry | undefined> {
  if (!hasSanityConfig) return getPublicBySlugLocal(kind, slug);
  const row = await sanityBySlug(kind, slug);
  return row || getPublicBySlugLocal(kind, slug);
}

export async function getPublishedBySlug(kind: ContentKind, slug: string): Promise<ContentEntry | undefined> {
  if (!hasSanityConfig) return getPublishedBySlugLocal(kind, slug);
  const row = await sanityByPublishedSlug(kind, slug);
  return row || getPublishedBySlugLocal(kind, slug);
}

export async function getPublicByTag(tag: string): Promise<ContentEntry[]> {
  const normalized = normalizeTag(tag);
  const all = await getAllPublicContent();
  return all.filter((entry) => entry.tags?.some((t) => normalizeTag(t) === normalized));
}

export async function getFeaturedProjects(): Promise<ContentEntry[]> {
  if (!hasSanityConfig) return getFeaturedProjectsLocal();
  const rows = await sanityFetch<SanityEntry[]>(
    `*[_type == "project" && status == "published" && visibility != "unlisted" && featured == true] | order(publishedAt desc)[0...3] ${SANITY_SELECT}`,
  );
  if (rows && rows.length > 0) {
    return rows.map(mapSanityEntry).filter((x): x is ContentEntry => Boolean(x));
  }
  return getFeaturedProjectsLocal();
}

export async function getRecentContent(limit = 8): Promise<ContentEntry[]> {
  const all = await getAllPublicContent();
  return all.slice(0, limit);
}

export async function getTagList(): Promise<string[]> {
  const all = await getAllPublicContent();
  return [...new Set(all.flatMap((entry) => (entry.tags ?? []).map(normalizeTag)))].sort();
}

export function contentUrl(entry: Pick<ContentEntry, 'kind' | 'slug'>): string {
  return `/${entry.kind === 'ideaOutline' ? 'ideas' : `${entry.kind}s`}/${entry.slug}`;
}
