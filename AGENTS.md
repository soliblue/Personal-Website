# Working on soli.blue

Be concise. Preserve the Windows 95 design and existing project data.

- Stack: Vue 3, Vite, Cloudflare Pages (`soli-blue`, branch `master`), Pages Functions, D1 `soli-visitor-board`.
- Domain: https://soli.blue. Static output: `dist/`; functions: `functions/`.
- Checks: `npm run lint`, `npm test`, `npm run test:e2e`, `npm run build`, `npm audit`.
- Before D1 schema changes, export a remote backup outside the repository. Keep credentials and `.dev.vars` out of git.
- Deploy with `npx wrangler pages deploy dist --project-name soli-blue --branch master`. Verify the immutable URL and custom domain serve matching hashed assets and working API responses.
- Browser tests use Chromium desktop and Pixel 5. Contact tests must use a stub unless sending email is explicitly authorized.
