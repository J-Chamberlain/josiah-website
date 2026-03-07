import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (rule) => rule.required() }),
    defineField({ name: 'description', type: 'text' }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
    defineField({ name: 'status', type: 'string', options: { list: ['draft', 'published'] }, initialValue: 'draft', validation: (rule) => rule.required() }),
    defineField({ name: 'visibility', type: 'string', options: { list: ['public', 'unlisted'] }, initialValue: 'public', validation: (rule) => rule.required() }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] }),
    defineField({ name: 'images', type: 'array', of: [{ type: 'imageFigure' }], validation: (rule) => rule.min(1) }),
  ],
});
