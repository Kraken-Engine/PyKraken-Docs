import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { guideCode } from './scripts/remark-guide-code.mjs';
export default defineConfig({
 site: process.env.SITE_URL || 'https://krakenengine.org',
 base: process.env.BASE_PATH || '/',
 output: 'static', trailingSlash: 'ignore', integrations: [mdx({ gfm: true, remarkPlugins: [guideCode] })],
 markdown: { shikiConfig: { theme: 'github-dark', wrap: true } }
});
