# soli.blue

Soli’s personal website: a Windows 95 desktop, projects, résumé, guestbook, chat, and alternate themes.

Requires Node.js 22.12+.

```sh
npm ci
npm run dev                  # http://127.0.0.1:8080
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

Vue 3 and Vite produce `dist/`. Routes load separately; production assets have content hashes and no source maps. `static/` retains its public `/static/` URLs; Pages headers, redirects, discovery documents, and the 404 page are also copied to the site root. Every public route gets its own entry file so Pages clean URLs preserve direct links. Profile and project data live in `src/assets/` and are shared with the API.

## API and deployment

Cloudflare Pages project: `soli-blue`, production branch: `master`, domain: `soli.blue`.

Pages Functions use the D1 binding in `wrangler.toml`. Required secrets: `GOOGLE_AI_API_KEY`, `RESEND_API_KEY`, `BOARD_HASH_SALT`. Optional contact settings: `CONTACT_TO` and `CONTACT_FROM`. Never commit secrets.

```sh
npx wrangler d1 migrations apply soli-visitor-board --local
npx wrangler pages dev dist --ip 127.0.0.1 --port 8788
# Set local secrets in an ignored .dev.vars file.

# Back up D1 before applying production migrations.
npx wrangler d1 export soli-visitor-board --remote --output /tmp/soli-board-backup.sql
npx wrangler d1 migrations apply soli-visitor-board --remote
npx wrangler pages deploy dist --project-name soli-blue --branch master
```

Before deployment, pass lint, unit tests, browser tests, build, and `npm audit`. Afterwards, verify both the deployment URL and custom domain, asset hashes, guestbook reads, and chat. Test contact delivery with a stub to avoid sending unsolicited email.

Chat/contact writes use bounded JSON parsing, origin validation, upstream timeouts, and atomic D1 rate limits. Chat permits 12 requests/minute and 100/day per IP; contact permits five/10 minutes. These controls limit abuse but are not authentication. The board accepts predefined notes and retains rate-limit identifiers for one day. No session-replay tracker is included.

Rollback: redeploy the checkpoint commit from a separate worktree or select the previous Pages deployment. Migration 0002 is additive and compatible with the previous version.
