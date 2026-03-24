import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'imageFigure',
  title: 'Image Figure',
  type: 'object',
  fields: [
    defineField({ name: 'image', type: 'image', options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: 'alt', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'caption', type: 'string' }),
    defineField({ name: 'fullWidth', type: 'boolean', initialValue: false }),
  ],
});
