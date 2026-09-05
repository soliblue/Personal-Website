import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { cpSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [vue(), {
    name: 'static-pages-files',
    closeBundle() {
      cpSync('static', 'dist/static', { recursive: true });
      const routes = ['animation', 'terminal', 'newspaper', 'windows95', 'wikipedia', 'space', 'code-hop', 'home', 'pins', 'resume', 'projects'];
      for (const app of ['habibi', 'habibis']) {
        for (const page of ['marketing', 'privacy', 'terms']) routes.push(`apps/${app}/${page}`);
      }
      for (const route of routes) {
        mkdirSync(dirname(`dist/${route}.html`), { recursive: true });
        cpSync('dist/index.html', `dist/${route}.html`);
      }
      for (const file of ['_headers', '_redirects', '404.html', 'robots.txt', 'sitemap.xml', 'llms.txt']) {
        cpSync(`static/${file}`, `dist/${file}`);
      }
    },
  }],
  publicDir: false,
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }, extensions: ['.mjs', '.js', '.json', '.vue'] },
  server: { host: process.env.HOST || '127.0.0.1', port: Number(process.env.PORT || 8080), strictPort: true },
  build: { sourcemap: false },
});
