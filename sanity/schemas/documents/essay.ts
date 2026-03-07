import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'essay',
  title: 'Essay',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (rule) => rule.required() }),
    defineField({ name: 'excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
    defineField({ name: 'status', type: 'string', options: { list: ['draft', 'published'] }, initialValue: 'draft', validation: (rule) => rule.required() }),
    defineField({ name: 'visibility', type: 'string', options: { list: ['public', 'unlisted'] }, initialValue: 'public', validation: (rule) => rule.required() }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] }),
    defineField({ name: 'coverImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'mediaEmbed' }, { type: 'imageFigure' }] }),
  ],
});
