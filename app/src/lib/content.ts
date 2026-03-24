import type { ContentEntry, ContentKind } from './types';
import { normalizeTag } from './tags';

const entries: ContentEntry[] = [
  {
    id: 'project-2',
    kind: 'project',
    title: 'Bridge to the Slipstream',
    slug: 'bridge-to-the-slipstream',
    simulationEmbed: 'slipstream',
    excerpt: 'A lightweight cycling micro-simulation about spending effort to catch a faster group, then recovering inside the draft.',
    publishedAt: '2026-03-16',
    visibility: 'public',
    tags: ['Simulation', 'Cycling', 'Interaction'],
    body: [
      { type: 'paragraph', text: 'Bridge to the Slipstream is a small browser simulation about the economics of drafting in cycling. The premise is simple: burn effort to bridge up to a faster group, then settle into the pocket behind them and watch the cumulative effort curve flatten.' },
      { type: 'paragraph', text: 'Use Start to begin. The effort slider changes how hard you push, and the position slider lets you move laterally across the lane to find the strongest draft. Once you are close enough and centered behind the group, the drag penalty drops and the simulation resolves.' },
      { type: 'note', text: 'Keyboard input also works when the figure has focus: arrow keys or WASD adjust effort and position.' },
    ],
  },
  {
    id: 'essay-1',
    kind: 'project',
    title: 'Draft Project Placeholder',
    slug: 'building-better-human-machine-creative-workflows',
    excerpt: 'Preview content — not final.',
    publishedAt: '2026-03-01',
    visibility: 'public',
    tags: ['Preview'],
    coverImage: {
      src: '/images/terraced_design.jpeg',
      alt: 'Draft project placeholder cover image',
      caption: 'Draft project image placeholder',
      width: '100%',
      align: 'center',
      positionX: '100%', // horizontal focal point
      positionY: '25%', // vertical focal point: try '0%' vs '100%' to see top/bottom shift
    },
    body: [
      { type: 'paragraph', text: 'This section is under development.' },
      { type: 'paragraph', text: 'Draft project placeholder content for preview only.' },
      //{ type: 'youtube', id: 'dQw4w9WgXcQ', title: 'Reference lecture' },
      { type: 'bottom', text: 'Preview content — not final.' },
    ],
  },
  {
    id: 'project-1',
    kind: 'essay',
    title: 'Pastoral Transcendentalism',
    subtitle: 'Conjuring Frederick Law Olmsted in AI-Enabled Design',
     slug: 'project-olmsted',
    // excerpt: 'A mixed-media exploration combining writing, diagrams, and audio notes.',
    publishedAt: '2026-02-18',
    visibility: 'public',
    tags: ['AI', 'Philosophy'],

    coverImage: {
      src: '/images/central-park-ny.jpg',
      alt: 'The modified Greensward Plan for Central Park, 1868',
      caption: '[Central Park, N.Y.], Library of Congress Prints and Photographs Division (public domain)',
      width: '90%',
      align: 'center',
      cropHeight: 80,
      naturalAspect: 2104 / 860,
    },

    body: [
     // { type: 'heading', text: 'Overview' },
      { type: 'paragraph', text: `In March 1858, Frederick Law Olmsted and Calvert Vaux delivered the \u201cGreensward\u201d plan in the competition to design Central Park. New York was in full industrial roar. The city\u2019s streets were a percussion: iron wheels on cobblestone, the clatter of horse traffic, vendors, and factories. Between 1800 and 1858, the city\u2019s population had increased nearly tenfold. Slaughterhouses, tanneries, and ironworks crowded the lower wards alongside immigrant housing. New York had transformed from a busy port into a fully industrialized city.` },
 
      { type: 'paragraph', text: `Olmsted and Vaux named their design philosophy \u201cpastoral transcendentalism,\u201d not an attempt at returning to an untouched nature; rather, it was a nature-inspired composition. The hills were not hills. The wilderness was not wild. It was designed and constructed by the tools and resources of industrialization from which it would offer \u201cthe most agreeable contrast to the confinement, bustle, and monotonous street-division of the city.\u201d` },

      { type: 'paragraph', text: `Elsewhere, Olmsted would campaign for pure conservation. In his 1865 report on Yosemite, which would be buried for political reasons but have significant influence in the creation of the National Parks system, Olmsted argued the Yosemite land should be held \u201cfor the free use of the whole body of the people forever.\u201d And in the 1879 report on the preservation of Niagara Falls, co-authored by Olmsted, they argued that restoring the former beauty of the falls was a \u201csacred obligation to mankind.\u201d` },
      {
        type: 'image',
        src: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Looking_Down_Yosemite-Valley.jpg',
        alt: 'Looking Down Yosemite Valley',
        caption: 'Looking Down Yosemite Valley \u2014 Albert Bierstadt, 1865',
        width: '80%',
        align: 'center',
        cropHeight: 80,
        naturalAspect: 2104 / 860,
      },
      { type: 'paragraph', text: `Olmsted\u2019s stance on conservation was nuanced. He recognized there were natural landscapes so grand and pristine, they should be preserved for later generations to behold in their pure natural perfection. Yet, he did not reject the force and directionality of industrialization. Indeed, he wielded those very tools of industry to enable and restore experiences industry was destroying. His parks were fake wilderness built with real bulldozers.` },
      { type: 'paragraph', text: `The challenges we face today are in many ways a supercharged mirror of what Olmsted\u2019s generation confronted. The land rush of our time is not for real estate in the conventional sense, though it includes that too. It is, among other mediums, an opportunistic rush for the real estate of our attention, our time, and our cognitive landscape. As Olmsted recognized that industrialization was inevitable, given sufficient time, resources, and relative prosperity, we might reasonably say the same about artificial intelligence. It was always coming. The questions we are faced with now are not dissimilar to the industrial age. We must recognize those territories that are so sacred, they must be left intact and protected from the encroachment of capital interests while also embracing the unprecedented opportunity to re-imagine natural harmony\u2026` },
      { type: 'paragraph', text: `The stage is being set at this moment that will determine the lived experience of generations to follow. The systems and technologies that get built (\u2026at the dawn of a new era\u2026) tend to persist and get built upon and around. Technologies become locked-in. Bronze only gave way to iron after the societal collapse, even though the process of extracting iron had been understood generations preceding the Greek dark ages. We are all subject to the long-horizon lock-in of distasteful and soulless architecture. Like the air we breathe, we live inside these designs of the past. The origins of poorly designed or inferior infrastructure are manifold, either from greed, carelessness, or the designers are simply rushed or ill-informed. Nevertheless, their creations often persist centuries after they are recognized as distasteful and after better alternatives exist, they are locked-in.` },
      { type: 'paragraph', text: `The people who are shaping how AI integrates into our daily lives now are creating the built environments that future generations will inhabit. We needn\u2019t assume they are motivated by greed or carelessness but they are definitely being rushed, often, ironically, lamenting the pace they impose on each other. While many of them are aware of their role in history and the awesome influence they wield, we should not attribute to them magical clairvoyance. Policy is, indeed, required to guard against the most catastrophic outcomes. However, as a motorcycle instructor once told me, if you focus on the object you want to avoid, you often steer directly into it. Rather, you should look to where you want to be going.` },
      { type: 'paragraph', text: `I believe the designers of our age will be eager to receive from us, collectively and individually, our own version of the \u201cGreensward\u201d plan. We need not be AI developers to imagine the future we want to live in. We are, each of us, experts in our own domain: our own lives, our own attention. If we take a moment to reflect, we can develop our own sense of what has been quietly eroded or violently uprooted by postmodern industrialization. Olmsted himself was not a trained landscape architect. He relied on his personal appreciation of the \u201cpastoral landscape\u201d and utilized the tools of his industrial age to guard against its worst tendencies. We have, right now, an urgency and agency greater than any generation of the past. We have an unprecedented opportunity to design the means of enhancing, and in many ways restoring, the human experience.` },
      { type: 'paragraph', text: `Throughout this series, I aim to explore how we might collectively and individually influence the design of our physical and digital landscapes. I will re-imagine a day in my own life, one that leverages my own strengths and bolsters my weaker tendencies. I will attempt to imagine a long-horizon future, one that is informed by our deep evolutionary past. I will consider how much of our innate strength and wisdom has atrophied and been nearly forgotten.` },
      { type: 'paragraph', text: `I will propose how we might design AI not in our own image but a complement to it. We might mold and cast our ideal reinforcements, to our flourishing primordial alignment. Not as a relinquishment of agency and effort, rather, to leverage our capacity for social contribution, community building, and our pursuit of mastery.` },
    ],
  },
  {
    id: 'idea-1',
    kind: 'ideaOutline',
    title: 'Placeholder Idea Outline',
    slug: 'humane-ai-interfaces',
    excerpt: 'Preview content — not final.',
    publishedAt: '2026-02-09',
    visibility: 'public',
    tags: ['Preview'],
    ideaStage: 'exploring',
    openQuestions: ['Placeholder question: final scope pending.', 'Placeholder question: details in progress.'],
    body: [
      { type: 'paragraph', text: 'This section is under development.' },
      { type: 'paragraph', text: 'Preview outline text — not final.' },
    ],
  },
  {
    id: 'gallery-1',
    kind: 'gallery',
    title: 'Draft Gallery Placeholder',
    slug: 'quiet-light-studies',
    excerpt: 'Preview content — not final.',
    publishedAt: '2026-01-26',
    visibility: 'public',
    tags: ['Preview'],
    body: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1800&q=80', alt: 'Draft gallery placeholder image one', caption: 'Placeholder image 01', fullWidth: true },
      { type: 'image', src: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1800&q=80', alt: 'Draft gallery placeholder image two', caption: 'Placeholder image 02' },
    ],
  },
  {
    id: 'essay-unlisted-1',
    kind: 'essay',
    title: 'Placeholder Draft (Unlisted)',
    slug: 'draft-internal-notes-on-energy-systems',
    excerpt: 'Preview content — not final.',
    publishedAt: '2026-02-23',
    visibility: 'unlisted',
    tags: ['Preview'],
    body: [{ type: 'paragraph', text: 'This section is under development.' }],
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

export function getFeaturedEssays(): ContentEntry[] {
  return getPublicByKind('essay').slice(0, 3);
}

export function getRecentContent(): ContentEntry[] {
  return getPublicContent().slice(0, 8);
}
