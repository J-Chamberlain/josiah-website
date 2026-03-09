export type ContentKind = 'essay' | 'project' | 'ideaOutline' | 'gallery';
export type Visibility = 'public' | 'unlisted';

export type ContentEntry = {
  id: string;
  kind: ContentKind;
  title: string;
  subtitle?: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  visibility: Visibility;
  tags?: string[];
  coverImage?: {
    src: string;
    alt: string;
    caption?: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    /** Horizontal crop focal point (e.g. '0%', '50%', '100%', 'left', 'right'). */
    positionX?: string;
    /** Vertical crop focal point (e.g. '0%', '50%', '100%', 'top', 'bottom'). */
    positionY?: string;
    /** Show only this % of the image height (centered vertically). Requires naturalAspect. */
    cropHeight?: number;
    /** Original image width / height ratio, needed to compute aspect-ratio for cropHeight. */
    naturalAspect?: number;
  };
  body: Array<
    | { type: 'paragraph'; text: string }
    | { type: 'heading'; text: string }
    | { type: 'youtube'; id: string; title: string }
    | { type: 'spotify'; url: string; title: string }
    | { type: 'image'; src: string; alt: string; caption?: string; fullWidth?: boolean; width?: string; align?: 'left' | 'center' | 'right'; cropWidth?: number; cropHeight?: number; naturalAspect?: number }
    | { type: 'note'; text: string }
  >;
  ideaStage?: 'seed' | 'exploring' | 'on-hold' | 'shipping';
  openQuestions?: string[];
};

export type SiteSettings = {
  siteTitle: string;
  siteDescription: string;
  homepageStatement: string;
  subscribeCta: string;
  subscribeIntro: string;
  defaultOgImage: string;
  footerBlurb: string;
  contactEmail: string;
  aboutIntro: string;
  aboutCanonicalNote: string;
  privacyIntro: string;
  privacyDataUse: string;
  privacyUnsubscribe: string;
  socialLinks?: string[];
  mainNav?: string[];
};
