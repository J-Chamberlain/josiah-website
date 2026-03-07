import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'mediaEmbed',
  title: 'Media Embed',
  type: 'object',
  fields: [
    defineField({ name: 'provider', type: 'string', options: { list: ['youtube', 'spotify'] }, validation: (rule) => rule.required() }),
    defineField({ name: 'value', title: 'YouTube ID or Spotify Embed URL', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'title', type: 'string' }),
  ],
});
