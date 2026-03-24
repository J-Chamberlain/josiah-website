import type { SiteSettings } from './types';
import { sanityFetch, urlFor, hasSanityConfig } from './sanity';

export const SITE_SETTINGS: SiteSettings = {
  siteTitle: 'Personal Studio (Preview)',
  siteDescription: 'Preview site — draft content in progress.',
  homepageStatement: 'Preview content — not final.',
  subscribeCta: 'Preview signup text — final messaging pending.',
  subscribeIntro: 'This subscription section is under development for preview.',
  defaultOgImage: '/og-default.jpg',
  footerBlurb: 'Preview content in progress.',
  contactEmail: 'hello@example.com',
  aboutIntro: 'About page placeholder. This section is under development.',
  aboutCanonicalNote: 'Preview note: publishing/canonical policy text is not final.',
  privacyIntro: 'Privacy page placeholder. Final policy language is still in draft.',
  privacyDataUse: 'Preview content — not final.',
  privacyUnsubscribe: 'Placeholder unsubscribe/deletion contact text:',
};

export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/essays-projects', label: 'Essays & Projects' },
  { href: '/about', label: 'About' },
  { href: '/subscribe', label: 'Subscribe' },
] as const;

type SanitySiteSettings = {
  siteTitle?: string;
  siteDescription?: string;
  homepageStatement?: string;
  subscribeCta?: string;
  subscribeIntro?: string;
  defaultOgImage?: unknown;
  footerBlurb?: string;
  contactEmail?: string;
  aboutIntro?: string;
  aboutCanonicalNote?: string;
  privacyIntro?: string;
  privacyDataUse?: string;
  privacyUnsubscribe?: string;
  socialLinks?: string[];
  mainNav?: string[];
};

let cachedSettings: SiteSettings | null = null;
let cachedAt = 0;

export async function getSiteSettings(): Promise<SiteSettings> {
  const now = Date.now();
  if (cachedSettings && now - cachedAt < 60_000) return cachedSettings;
  if (!hasSanityConfig) return SITE_SETTINGS;

  const row = await sanityFetch<SanitySiteSettings>(`*[_type == "siteSettings"][0]{
    siteTitle,
    siteDescription,
    homepageStatement,
    subscribeCta,
    subscribeIntro,
    defaultOgImage,
    footerBlurb,
    contactEmail,
    aboutIntro,
    aboutCanonicalNote,
    privacyIntro,
    privacyDataUse,
    privacyUnsubscribe,
    socialLinks,
    mainNav
  }`);

  if (!row) return SITE_SETTINGS;

  const ogImage =
    row.defaultOgImage && urlFor ? urlFor.image(row.defaultOgImage).width(1600).auto('format').url() : SITE_SETTINGS.defaultOgImage;

  cachedSettings = {
    siteTitle: row.siteTitle || SITE_SETTINGS.siteTitle,
    siteDescription: row.siteDescription || SITE_SETTINGS.siteDescription,
    homepageStatement: row.homepageStatement || SITE_SETTINGS.homepageStatement,
    subscribeCta: row.subscribeCta || SITE_SETTINGS.subscribeCta,
    subscribeIntro: row.subscribeIntro || SITE_SETTINGS.subscribeIntro,
    defaultOgImage: ogImage,
    footerBlurb: row.footerBlurb || SITE_SETTINGS.footerBlurb,
    contactEmail: row.contactEmail || SITE_SETTINGS.contactEmail,
    aboutIntro: row.aboutIntro || SITE_SETTINGS.aboutIntro,
    aboutCanonicalNote: row.aboutCanonicalNote || SITE_SETTINGS.aboutCanonicalNote,
    privacyIntro: row.privacyIntro || SITE_SETTINGS.privacyIntro,
    privacyDataUse: row.privacyDataUse || SITE_SETTINGS.privacyDataUse,
    privacyUnsubscribe: row.privacyUnsubscribe || SITE_SETTINGS.privacyUnsubscribe,
    socialLinks: row.socialLinks || [],
    mainNav: row.mainNav || NAV_ITEMS.map((n) => n.label),
  };
  cachedAt = now;

  return cachedSettings;
}
