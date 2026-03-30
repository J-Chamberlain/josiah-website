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
    title: 'Digital Pastoralism',
    subtitle: 'Conjuring Frederick Law Olmsted in the Age of AI',
     slug: 'project-olmsted',
    // excerpt: 'A mixed-media exploration combining writing, diagrams, and audio notes.',
    publishedAt: '2026-02-18',
    visibility: 'public',
    tags: ['AI', 'Philosophy'],

    coverImage: {
      src: '/images/central-park-ny.jpg',
      alt: 'The modified Greensward Plan for Central Park, 1868',
      caption: "Bird's-eye view of Central Park, New York — Library of Congress",
      width: '90%',
      align: 'center',
      cropHeight: 80,
      naturalAspect: 2104 / 860,
    },

    body: [
      { type: 'paragraph', text: `In the early 2010s I lived near Laurelhurst Park in Portland, Oregon. I visited it often, sometimes adding it to my commute and lingering for a moment to look out on Firwood Lake or stroll through its meandering paths. I would marvel at the quality of the experience, how you could be anywhere in the park and feel like you were in nature, all the while being in the heart of the city. Somehow the park managed to accommodate crowds of people while providing privacy to the solo individual or intimate group of friends. It fostered a sense of community and simultaneously provided a respite from those same crowds.` },
      { type: 'paragraph', text: `What stood out to me was how far forward in time the designers had imagined. They anticipated the experience I would be having at that moment, a full century after it was finished. I thought about the care and precision they took in planning and arranging those great sequoias and the native conifers alongside them, and laying the paths that would meander and intersect. It all culminated in a flow that felt natural while at the same time there was a deliberateness in its design that nature rarely affords.` },
      { type: 'paragraph', text: `I later learned Laurelhurst was designed by Emanuel Mische, a disciple of Frederick Law Olmsted, who was most known for his co-design of Central Park in Manhattan with Calvert Vaux. Eventually, together with his sons, the Olmsted family designed several hundred parks, campuses, and estates throughout the United States. Each of their designs is unique while carrying the Olmsted signature: nature-inspired respites from the urban and industrial centers they were typically positioned within.` },
      { type: 'paragraph', text: `Born in 1822, Olmsted grew up taking long trips into the American wilderness with his father. He recounted returning from those trips changed, quieter, clearer, and more himself. Those early experiences had a profound influence on his thinking. In addition to inspiring his landscape design, they were the catalyst behind Olmsted's fight for the preservation of pristine natural beauty. Olmsted had a significant role in the creation of the National Park System, personally campaigning for the preservation of Yosemite, Niagara Falls, and other national treasures. He had a unique perspective among his contemporary conservationists. Olmsted believed these places should be made easily and broadly accessible, while protecting them from commercial exploitation, and preserved in as close to their original form as possible.` },
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
      { type: 'paragraph', text: `These principles of accessibility and preservation are deeply embedded in the philosophy of our National Park System today, and Olmsted deserves much of the credit. Yet he was clear-eyed about their limits. Venturing out to these great natural wonders was a luxury most could not afford, and the rapid urbanization of the US population meant that the semi-rural, visually open lifestyle of his childhood was disappearing, being replaced with noise and industrial intensity. The vast natural landscape he had found so restorative as a child would rarely, if ever, be available to the vast majority of urban Americans. He was convinced, however, that he could bring the essential qualities of that experience to the heart of where people actually lived.` },
      { type: 'paragraph', text: `Olmsted’s design philosophy has been described by some scholars as a kind of “pastoral transcendentalism,” inspired by the pastoral landscapes he encountered as a child. Yet he did not reject the forces of industrialization outright. He saw them as inevitable and chose to work through them rather than against them. He wielded the tools of his age to build the very experiences that age was eroding. His parks were engineered and artificial, constructed wilderness shaped with imported boulders. Their lakes and ponds were excavated, graded, and controlled through hidden systems of pipes and circulation. These were not grand, pristine natural wonders, yet they were deliberately composed to elicit the same restorative qualities.` },
      { type: 'paragraph', text: `I believe Olmsted's philosophy has a great deal to offer us today as we enter the age of AI. Like Olmsted, we must be pragmatic and nuanced in naming and protecting those areas that should be preserved in their original form. But also, there are spaces in our lives, both physical and metaphorical, that warrant reimagining and careful engineering. Like Olmsted, we might build environments that are artificial yet nonetheless deliver the restoration we need, not despite the tools of our age, but by wielding them.` },
      { type: 'paragraph', text: `The decisions being made right now about how AI integrates into daily life will outlast the people making them. Early design decisions have a way of hardening into the background of life. We inherit them, adapt to them, and eventually mistake them for inevitabilities. Even when better alternatives exist, systems tend to persist. We built our cities around the automobile and yielded the movement of pedestrian life in its service. We live inside the designs of the past, rarely noticing them or questioning whether they still serve us. Many of the people designing AI systems today are likely genuine and well-intentioned, but they are operating under conditions of competition and speed, with limited insight into the long-term implications of their choices.` },
      { type: 'paragraph', text: `We need not be AI developers to have a stake in how this unfolds. We are each experts in our own domain: our own lives, our own attention, our own sense of what has been eroded by the pace of modern life. Olmsted himself was not a trained landscape architect. He was someone who trusted his own experience of what it felt like to be restored, and he shaped the future with that intuition.` },
      { type: 'paragraph', text: `In the series of essays that will follow, I intend to explore how we might collectively and individually influence the design of our physical and digital landscapes. I will attempt to imagine a long-horizon future and a day in a life that leverages AI to bolster our own strengths and restore a natural alignment that seems to be quickly eroding in our digital age.` },
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
