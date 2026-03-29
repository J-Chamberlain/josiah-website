export type EditorialCardItem = {
  title: string;
  href?: string;
  label: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  layoutSlot?: 'featured' | 'large' | 'medium';
};

export const BRIDGE_TO_THE_SLIPSTREAM: EditorialCardItem = {
  title: 'Slipstreams of Attention',
  href: '/projects/bridge-to-the-slipstream',
  label: 'IDEA · DRAFT',
  description: 'Finding the hidden currents of focus where effort gives way to flow.',
  imageSrc: '/images/Slipstream_V3.jpg',
  imageAlt: 'A conceptual slipstream image.',
};

export const HOMEPAGE_MANIFEST: EditorialCardItem[] = [
  {
    title: 'Conjuring Olmsted',
    href: '/essays/project-olmsted',
    label: 'ESSAY',
    description: 'Designing a life that balances the power of technology with the need for restoration.',
    imageSrc: '/images/Ideas_page/Central_Park_Sapia.jpg',
    imageAlt: 'A stylized view inspired by Central Park and restorative landscape design.',
    layoutSlot: 'featured',
  },
  {
    title: 'History Explorer',
    href: '/history-explorer',
    label: 'PROJECT · IN PROGRESS',
    description: 'Turning history into a landscape—something to navigate, not just read.',
    imageSrc: '/images/Ideas_page/Timeline_of_world_history_sapia.jpg',
    imageAlt: 'A stylized world history timeline image.',
    layoutSlot: 'large',
  },
  {
    title: 'Slipstreams of Attention',
    href: '/projects/bridge-to-the-slipstream',
    label: 'IDEA · DRAFT',
    description: 'Finding the hidden currents of focus where effort gives way to flow.',
    imageSrc: '/images/Slipstream_V3.jpg',
    imageAlt: 'A conceptual slipstream image.',
    layoutSlot: 'medium',
  },
  {
    title: 'Teaching a Cat to be a Cat',
    href: '/ideas/teaching-a-cat-to-be-a-cat',
    label: 'IDEA · DRAFT',
    description: 'Shaping environments that draw out what is already natural within us.',
    imageSrc: '/images/Ideas_page/Rita_GPT.png',
    imageAlt: 'A stylized cat portrait representing natural instinct and environment.',
    layoutSlot: 'medium',
  },
  {
    title: 'Exploring Kashmir',
    href: '/kashmir',
    label: 'PROJECT · IN PROGRESS',
    description: 'Planning a journey through terrain, story, and uncertainty, one segment at a time.',
    imageSrc: '/images/Ideas_page/Kashmir_motorcycle.png',
    imageAlt: 'A motorcycle journey image representing route planning through Kashmir.',
    layoutSlot: 'medium',
  },
  {
    title: 'Terrace Building',
    href: '/ideas/terrace-building',
    label: 'IDEA · DRAFT',
    description: 'Reimagining urban life as a living landscape where density, nature, and community coexist.',
    imageSrc: '/images/Ideas_page/Tarraced_Building_V4.jpeg',
    imageAlt: 'A terraced building concept rendering.',
    layoutSlot: 'medium',
  },
];

export const ANCHOR_ESSAY = HOMEPAGE_MANIFEST.find((item) => item.layoutSlot === 'featured')!;
export const HOMEPAGE_GRID_ITEMS = HOMEPAGE_MANIFEST.filter((item) => item.layoutSlot !== 'featured');

export const PROJECT_ITEMS: EditorialCardItem[] = [
  {
    title: 'History Explorer',
    href: '/history-explorer',
    label: 'PROJECT · IN PROGRESS',
    description: 'Turning history into a landscape—something to navigate, not just read.',
    imageSrc: '/images/Ideas_page/Timeline_of_world_history_sapia.jpg',
    imageAlt: 'A stylized world history timeline image.',
  },
  {
    title: 'Exploring Kashmir',
    href: '/kashmir',
    label: 'PROJECT · IN PROGRESS',
    description: 'Planning a journey through terrain, story, and uncertainty, one segment at a time.',
    imageSrc: '/images/Ideas_page/Kashmir_motorcycle.png',
    imageAlt: 'A motorcycle journey image representing route planning through Kashmir.',
  },
  {
    title: 'COBDR Interactive Companion',
    href: '/cobdr',
    label: 'PROJECT · IN PROGRESS',
    description: 'A route companion for exploring the Colorado BDR as sections, terrain, and logistics.',
  },
];

export const IDEA_ITEMS: EditorialCardItem[] = [
  BRIDGE_TO_THE_SLIPSTREAM,
  ...HOMEPAGE_MANIFEST.filter((item) => item.label === 'IDEA · DRAFT'),
];

export const IDEAS_PAGE_ITEMS: EditorialCardItem[] = HOMEPAGE_MANIFEST.filter((item) => item.label === 'IDEA · DRAFT');
