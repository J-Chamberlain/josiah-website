import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteTitle', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'siteDescription', type: 'text' }),
    defineField({ name: 'homepageStatement', type: 'text' }),
    defineField({ name: 'subscribeCta', type: 'string' }),
    defineField({ name: 'subscribeIntro', type: 'text' }),
    defineField({ name: 'defaultOgImage', type: 'image' }),
    defineField({ name: 'footerBlurb', type: 'string' }),
    defineField({ name: 'contactEmail', type: 'string' }),
    defineField({ name: 'aboutIntro', type: 'text' }),
    defineField({ name: 'aboutCanonicalNote', type: 'text' }),
    defineField({ name: 'privacyIntro', type: 'text' }),
    defineField({ name: 'privacyDataUse', type: 'text' }),
    defineField({ name: 'privacyUnsubscribe', type: 'text' }),
    defineField({ name: 'socialLinks', type: 'array', of: [{ type: 'url' }] }),
    defineField({ name: 'mainNav', type: 'array', of: [{ type: 'string' }], initialValue: ['Home', 'Essays & Projects', 'About', 'Subscribe'] }),
  ],
});
