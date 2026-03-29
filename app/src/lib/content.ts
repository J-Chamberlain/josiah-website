import type { ContentEntry, ContentKind } from './types';
import { normalizeTag } from './tags';

const entries: ContentEntry[] = [
  {
    id: 'idea-2',
    kind: 'ideaOutline',
    title: 'Terrace Building',
    slug: 'terrace-building',
    excerpt: 'Reimagining urban life as a living landscape where density, nature, and community coexist.',
    publishedAt: '2026-03-28',
    visibility: 'public',
    tags: ['Architecture', 'Environment'],
    coverImage: {
      src: '/images/Ideas_page/Tarraced_Building_V4.jpeg',
      alt: 'A terraced building concept rendering.',
      width: '68%',
      align: 'center',
    },
    body: [
      { type: 'paragraph', text: 'Synopsis:' },
      { type: 'paragraph', text: 'Inspired by terraced landscapes in Nepal, Olmsted’s philosophy of restorative design, and contemporary eco-district planning, this piece explores a new architectural form for urban life: one that reconciles density with nature, privacy with community.' },
      { type: 'paragraph', text: 'At its core is a simple inversion. Instead of stacking people into uniform vertical units, the building steps back with each level—like a hillside terrace—creating private outdoor spaces for every resident. Each dwelling becomes distinct, shaped by light, vegetation, and exposure, offering both retreat and connection. Residents can cultivate gardens, observe their surroundings, or withdraw into quiet—without ever leaving the structure.' },
      { type: 'paragraph', text: 'The design also reimagines community. Centered around a shared green space, it draws on older architectural principles where visibility, proximity, and shared space foster trust and safety. A child can be seen from above; a neighbor is present without intrusion. It is an environment where social cohesion emerges not from programming, but from form.' },
      { type: 'paragraph', text: 'In a time of constrained land, environmental pressure, and social fragmentation, this vision proposes a different path: high-density living that does not feel like compromise, but like a return—an urban habitat shaped, once again, by the logic of nature.' },
      {
        type: 'image',
        src: '/images/terraced_design.jpeg',
        alt: 'A terraced building design concept sketch.',
        width: '80%',
        align: 'center',
      },
    ],
  },
  {
    id: 'idea-1',
    kind: 'ideaOutline',
    title: 'Teaching a Cat to be a Cat',
    slug: 'teaching-a-cat-to-be-a-cat',
    excerpt: 'Shaping environments that draw out what is already natural within us.',
    publishedAt: '2026-03-28',
    visibility: 'public',
    tags: ['AI', 'Environment'],
    coverImage: {
      src: '/images/Ideas_page/Rita_GPT.png',
      alt: 'A stylized portrait of Rita.',
      width: '68%',
      align: 'center',
    },
    body: [
      { type: 'paragraph', text: 'Synopsis:' },
      { type: 'paragraph', text: 'What does it mean to create the right environment for a living being to thrive?' },
      { type: 'paragraph', text: 'This piece begins with a simple experiment: adopting a traumatized cat and redesigning its surroundings—not through training or discipline, but by reconstructing the conditions it evolved for. Elevated perches, safe vantage points, clear escape routes, access to stimulation and rest. The goal was not to change the cat, but to let it become what it already was.' },
      { type: 'paragraph', text: 'The results point to something broader. When the environment aligns with an organism’s nature, behavior begins to organize itself. Play emerges. Curiosity returns. Energy flows—not from force, but from fit.' },
      { type: 'paragraph', text: 'The same may be true for us. Much of modern life is structured in ways that conflict with our evolutionary design—flattening motivation, fragmenting attention, and turning effort into strain. But if we rethink our surroundings—our spaces, our workflows, even our definitions of work—we may find that many of the qualities we seek don’t need to be imposed. They can be evoked.' },
      { type: 'paragraph', text: 'In this light, AI becomes something new: not a tool for optimization within a broken system, but a partner in redesigning the system itself. A way of shaping environments that draw out what is already alive in us.' },
      { type: 'paragraph', text: 'Not teaching a cat to behave—but creating the conditions for it to be a cat.' },
    ],
  },
  {
    id: 'project-2',
    kind: 'project',
    title: 'Slipstreams of Attention',
    slug: 'bridge-to-the-slipstream',
    simulationEmbed: 'slipstream',
    excerpt: 'Finding the hidden currents of focus where effort gives way to flow.',
    publishedAt: '2026-03-16',
    visibility: 'public',
    tags: ['Simulation', 'Cycling', 'Interaction'],
    coverImage: {
      src: '/images/Slipstream_V3.jpg',
      alt: 'A conceptual illustration of riders moving through a slipstream.',
      width: '68%',
      align: 'center',
    },
    body: [
      { type: 'paragraph', text: 'Synopsis:' },
      { type: 'paragraph', text: 'We’ve been taught to rely on willpower—to push harder, endure more, and grind through resistance. But what if effort isn’t the point?' },
      { type: 'paragraph', text: 'Borrowing from the physics of cycling, this piece introduces a different model: the slipstream. In a peloton, riders conserve energy not by trying harder, but by positioning themselves within invisible currents of support. Effort doesn’t disappear—it becomes intelligently distributed.' },
      { type: 'paragraph', text: 'The same may be true of attention. Drawing on the science of flow and human performance, this essay argues that our greatest potential is unlocked not through force, but through alignment—working with our natural interests, strengths, and rhythms. There are cognitive “currents” available to us: states of deep focus, intrinsic motivation, and momentum that dramatically reduce friction while amplifying output.' },
      { type: 'paragraph', text: 'The implication is both personal and technological. If these states exist, why aren’t our lives designed to access them more consistently? And more importantly—could AI help us get there? Rather than demanding more discipline, we might begin to redesign our environments, habits, and feedback systems to place ourselves within these slipstreams more often.' },
      { type: 'paragraph', text: 'Not by pushing harder—but by learning where the energy already is.' },
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
