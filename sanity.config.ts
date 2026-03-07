import { defineConfig } from 'sanity';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'default',
  title: 'Personal Studio CMS',
  projectId: process.env.SANITY_PROJECT_ID || 'demo',
  dataset: process.env.SANITY_DATASET || 'production',
  plugins: [visionTool()],
  schema: { types: schemaTypes },
});
