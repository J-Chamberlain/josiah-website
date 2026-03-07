import type { ContentEntry, ContentKind } from './types';
import { normalizeTag } from './tags';

const entries: ContentEntry[] = [
  {
    id: 'essay-1',
    kind: 'essay',
    title: 'Building Better Human-Machine Creative Workflows',
    slug: 'building-better-human-machine-creative-workflows',
    excerpt: 'A practical essay on collaboration patterns for AI-assisted creative systems.',
    publishedAt: '2026-03-01',
    visibility: 'public',
    tags: ['AI', 'Design'],
    coverImage: { src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80', alt: 'Open notebook on desk' },
    body: [
      { type: 'paragraph', text: 'Most creative tooling fails when it asks humans to adapt to machine constraints instead of helping humans sustain meaningful momentum.' },
      { type: 'paragraph', text: 'A better workflow starts with short loops, explicit handoffs, and clear ownership over final judgment.' },
      { type: 'youtube', id: 'dQw4w9WgXcQ', title: 'Reference lecture' },
      { type: 'note', text: 'This is placeholder content and will be replaced by CMS content in Prompt 03.' },
    ],
  },
  {
    id: 'project-1',
    kind: 'project',
    title: 'Project Meridian',
    slug: 'project-meridian',
    excerpt: 'A mixed-media exploration combining writing, diagrams, and audio notes.',
    publishedAt: '2026-02-18',
    visibility: 'public',
    tags: ['AI', 'Philosophy'],
    body: [
      { type: 'heading', text: 'Overview' },
      { type: 'paragraph', text: 'Project Meridian examines how reflective practices can shape technical product decisions.' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=80', alt: 'Mountain ridgeline in warm light', caption: 'Field notes visual direction', fullWidth: true },
      { type: 'spotify', url: 'https://open.spotify.com/embed/episode/7makk4oTQel546B0PZlDM5', title: 'Audio field note' },
    ],
  },
  {
    id: 'idea-1',
    kind: 'ideaOutline',
    title: 'Idea Outline: Humane AI Interfaces',
    slug: 'humane-ai-interfaces',
    excerpt: 'Early-stage concept notes for calmer machine-mediated interactions.',
    publishedAt: '2026-02-09',
    visibility: 'public',
    tags: ['AI', 'Design'],
    ideaStage: 'exploring',
    openQuestions: ['What interaction rhythms reduce cognitive load?', 'How should interruptions be managed?'],
    body: [
      { type: 'paragraph', text: 'This outline captures interaction principles rather than implementation details.' },
      { type: 'paragraph', text: 'Primary premise: systems should optimize for continuity and reflection, not constant engagement.' },
    ],
  },
  {
    id: 'gallery-1',
    kind: 'gallery',
    title: 'Quiet Light Studies',
    slug: 'quiet-light-studies',
    excerpt: 'A standalone gallery exploring soft, contemplative composition.',
    publishedAt: '2026-01-26',
    visibility: 'public',
    tags: ['Design'],
    body: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1800&q=80', alt: 'Aerial river landscape', caption: 'Series I', fullWidth: true },
      { type: 'image', src: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1800&q=80', alt: 'Forest and mountain lake', caption: 'Series II' },
    ],
  },
  {
    id: 'essay-unlisted-1',
    kind: 'essay',
    title: 'Draft: Internal Notes on Energy Systems',
    slug: 'draft-internal-notes-on-energy-systems',
    excerpt: 'Unlisted draft should never appear in public indexes.',
    publishedAt: '2026-02-23',
    visibility: 'unlisted',
    tags: ['Energy'],
    body: [{ type: 'paragraph', text: 'Draft notes.' }],
  },
];

function byDateDesc(a: ContentEntry, b: ContentEntry): number {
  return a.publishedAt < b.publishedAt ? 1 : -1;
}

export function getAllContent(): ContentEntry[] {
  return [...entries].sort(byDateDesc);
}

export function getPublicContent(): ContentEntry[] {
  return getAllContent().filter((entry) => entry.visibility === 'public');
}

export function getPublicByKind(kind: ContentKind): ContentEntry[] {
  return getPublicContent().filter((entry) => entry.kind === kind);
}

export function getPublicBySlug(kind: ContentKind, slug: string): ContentEntry | undefined {
  return getPublicContent().find((entry) => entry.kind === kind && entry.slug === slug);
}

export function getPublishedBySlug(kind: ContentKind, slug: string): ContentEntry | undefined {
  return getAllContent().find((entry) => entry.kind === kind && entry.slug === slug);
}

export function getPublicByTag(tag: string): ContentEntry[] {
  const normalized = normalizeTag(tag);
  return getPublicContent().filter((entry) => entry.tags.some((t) => normalizeTag(t) === normalized));
}

export function getFeaturedProjects(): ContentEntry[] {
  return getPublicByKind('project').slice(0, 3);
}

export function getRecentContent(): ContentEntry[] {
  return getPublicContent().slice(0, 8);
}
