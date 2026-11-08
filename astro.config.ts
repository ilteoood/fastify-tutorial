import tutorialkit from '@tutorialkit/astro';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://fastify-tutorial.vercel.app',
  devToolbar: {
    enabled: false,
  },
  integrations: [
    tutorialkit({
      defaultRoutes: 'tutorial-only',
      components: {
        HeadTags: './src/components/HeadTags.astro',
      },
    }),
  ],
});
