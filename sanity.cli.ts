import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID || 'mw9h9dav',
    dataset: process.env.SANITY_DATASET || 'production'
  }
})
