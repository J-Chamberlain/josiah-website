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
    title: 'Conjuring Fredric Law Olmsted',
    subtitle: '"Pastoral Transcendentalism"',
    slug: 'project-olmsted',
    // excerpt: 'A mixed-media exploration combining writing, diagrams, and audio notes.',
    publishedAt: '2026-02-18',
    visibility: 'public',
    tags: ['AI', 'Philosophy'],
    coverImage: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/1868_Vaux_%5E_Olmsted_Map_of_Central_Park%2C_New_York_City_-_Geographicus_-_CentralPark-CentralPark-1869.jpg/1200px-1868_Vaux_%5E_Olmsted_Map_of_Central_Park%2C_New_York_City_-_Geographicus_-_CentralPark-CentralPark-1869.jpg',
      alt: 'The modified Greensward Plan for Central Park, 1868',
      caption: 'The modified Greensward Plan for Central Park',
      width: '90%',
      align: 'center',
    },
    body: [
     // { type: 'heading', text: 'Overview' },
      { type: 'paragraph', text: `In March 1858, Frederick Law Olmsted and Calvert Vaux delivered the \u201cGreensward\u201d plan in the competition to design Central Park. Outside, New York was in full industrial roar. The city\u2019s streets were a percussion: iron wheels on cobblestone, the clatter of horse traffic, vendors, and factories. The Greensward design philosophy, which they called \u201cpastoral transcendentalism,\u201d aimed not at returning to an untouched nature, rather, it was a nature-inspired composition. The hills were not hills. The wilderness was not wild. But the relief it produced was entirely real. The park they envisioned, in their own words, would offer \u201cthe most agreeable contrast to the confinement, bustle, and monotonous street-division of the city.\u201d` },
      {
        type: 'image',
        src: '/images/disfigured_banks_v2.jpeg',
        alt: 'Niagara by Louis Rémy Mignot',
        caption: '"Disfigured Banks" - Report on the preservation of Niagara Falls 1879',
        width: '40%',
        align: 'right',
      },
      { type: 'paragraph', text: `Olmsted moved from designer to conservationist. In his 1865 report on Yosemite, he argued the land should be held \u201cfor the free use of the whole body of the people forever.\u201d In a report on the preservation of Niagara Falls, co-authored by Olmsted, they argued that restoring the former beauty of the falls was a \u201csacred obligation to mankind.\u201d` },
      { type: 'paragraph', text: `He did not reject industrialization. He responded to it \u2014 sometimes as a conservationist drawing a line around what should not be consumed, sometimes as a designer using the very tools of industry to produce experiences industry was destroying. His parks were fake wilderness built with real bulldozers, and that was precisely the point.` },
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
  return getPublicContent().filter((entry) => entry.tags?.some((t) => normalizeTag(t) === normalized));
}

export function getFeaturedProjects(): ContentEntry[] {
  return getPublicByKind('project').slice(0, 3);
}

export function getRecentContent(): ContentEntry[] {
  return getPublicContent().slice(0, 8);
}
