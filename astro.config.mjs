import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';

const classification = process.env.MCP_BUILD_CLASSIFICATION ?? 'production';
if (!['production', 'preprod', 'development'].includes(classification)) {
  throw new Error('Invalid MCP build classification');
}

export default defineConfig({
  output: 'server',
  session: false,
  adapter: cloudflare({ imageService: 'passthrough' }),
  integrations: [react()],
  vite: {
    define: {
      'import.meta.env.MCP_BUILD_CLASSIFICATION': JSON.stringify(classification),
      'import.meta.env.PUBLIC_BUILD_TIMESTAMP': JSON.stringify(new Date().toISOString()),
    },
    plugins: [tailwind()],
    build: { target: 'chrome79', cssTarget: 'chrome79' },
  },
});
