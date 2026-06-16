// Cloudflare Pages Function — GET /api/md/*
// Serves agent-discovery markdown for each page (replaces the Firebase `page` fn).
import { generateMarkdown } from '../../_data.js';

export const onRequest = async ({ request }) => {
  const url = new URL(request.url);
  // Strip the /api/md prefix to get the page path (e.g. /api/md/resume -> /resume).
  const path = url.pathname.replace(/^\/api\/md/, '') || '/';

  const headers = {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  };

  const md = generateMarkdown(path);
  if (!md) {
    return new Response('# 404 — Page not found\n', { status: 404, headers });
  }

  headers['x-markdown-tokens'] = String(md.split(/\s+/).length);
  return new Response(md, { headers });
};
