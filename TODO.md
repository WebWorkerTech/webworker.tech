# TODO: Astro SSR Podcast Site

This repository is public. Keep private deployment records, server IPs, SSH
aliases, hosting-panel URLs, API keys, credentials, certificate details, and
production environment files outside git.

## Done

- Migrated the podcast site to Astro SSR with the Node adapter.
- Switched runtime episode data to Markdown files in `content/episodes`.
- Added RSS preview/import logic with title-based diffing.
- Added an admin page and protected admin API routes.
- Added Docker and production-style Compose files.
- Added a health endpoint at `/api/health`.
- Added `robots.txt`, noindex headers, and staging-safe indexing controls.
- Added Redis as an optional defensive/cache layer for rate limits and short
  JSON caches. Markdown remains the source of truth.
- Added Markdown HTML sanitization before rendering.
- Added public-page short cache headers and query-string stripping.
- Added Origin checks and rate limits for sensitive admin workflows.
- Added public-safe README and deployment docs.

## Open Follow-Ups

- Clean up unused icon imports reported by the Vite build.
- Decide whether the legacy JSON snapshot should stay in the repository long
  term or be moved to an import-only archive.
- Decide whether production admin auth should use only
  `ADMIN_PASSWORD_SHA256`.
- Add CDN/WAF configuration outside this repository if the site needs stronger
  distributed-traffic protection.
- Keep primary-domain cutover as a separate, explicitly approved operation.

## Verification Commands

```bash
pnpm run build
pnpm audit --audit-level moderate
docker compose config
JWT_SECRET=dev-secret \
ADMIN_PASSWORD=dev-password \
REDIS_PASSWORD=dev-redis-password \
REDIS_URL=redis://:dev-redis-password@redis:6379 \
docker compose -f docker-compose.prod.yml config
```
