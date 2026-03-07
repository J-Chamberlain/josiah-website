import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (rule) => rule.required() }),
    defineField({ name: 'excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
    defineField({ name: 'status', type: 'string', options: { list: ['draft', 'published'] }, initialValue: 'draft', validation: (rule) => rule.required() }),
    defineField({ name: 'visibility', type: 'string', options: { list: ['public', 'unlisted'] }, initialValue: 'public', validation: (rule) => rule.required() }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] }),
    defineField({ name: 'overview', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'sections', type: 'array', of: [{ type: 'block' }, { type: 'mediaEmbed' }, { type: 'imageFigure' }] }),
    defineField({ name: 'updates', type: 'array', of: [{ type: 'object', fields: [defineField({ name: 'date', type: 'datetime' }), defineField({ name: 'note', type: 'text' })] }] }),
  ],
});
