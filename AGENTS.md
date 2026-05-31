# AGENTS.md

This repository is the Web Worker podcast website. It is an Astro SSR app that
renders podcast pages from local Markdown files and provides a small admin
workflow for syncing the upstream podcast RSS feed into those Markdown files.

## Project Overview

- Framework: Astro 5 with `@astrojs/node` in standalone SSR mode.
- UI: Vue 3 components hydrated where interaction is needed.
- Styling: Tailwind CSS 4 via Vite plugin.
- Data source: Markdown files in `content/episodes`.
- Admin: `/admin` logs in with environment-configured credentials and can
  refresh RSS, compare by title, and import new episodes.
- Deployment target: Docker container, with `content/episodes` mounted as a
  persistent volume.

## Important Commands

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run import:episodes
pnpm run fetch-rss -- --preview
pnpm run fetch-rss
docker compose config
docker compose up --build
```

`pnpm run import:episodes` converts the legacy
`src/data/podcast-data.json` file into Markdown episode files.
`pnpm run fetch-rss` imports missing remote RSS items into Markdown files using
the same title-based diff rule as the admin UI.

## Runtime Configuration

Use `.env.example` as the starting point.

- `RSS_URL`: upstream podcast RSS feed.
- `EPISODES_DIR`: runtime Markdown directory. Defaults to `content/episodes`
  locally and `/app/content/episodes` in Docker.
- `REDIS_URL`: optional Redis URL for rate limiting and short JSON caches. When
  unset, the app falls back to process-local memory.
- `PUBLIC_SITE_URL`: canonical site URL, currently intended to be
  `https://new.webworker.tech` for staging.
- `PUBLIC_ALLOW_INDEXING`: keep `false` on staging. This makes `robots.txt`
  disallow all crawling and adds `noindex,nofollow,noarchive`.
- `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` or
  `ADMIN_PASSWORD_SHA256`: admin credentials.
- `RSS_AUTO_SYNC`: when `true`, the Node process periodically imports new RSS
  items.

## Data Model

Each episode is a Markdown file with frontmatter:

```yaml
---
title: No.96 Example
pubDate: '2026-05-29T00:00:00.000Z'
link: 'https://www.xiaoyuzhoufm.com/episode/...'
guid: episode-guid
audioUrl: 'https://...m4a'
duration: '01:05:33'
imageUrl: 'https://...png'
author: Web Worker
categories: []
description: Short summary
---
```

The Markdown body is rendered on episode detail pages.

## Editing Guidelines

- Preserve the existing cream/mint visual system and Chinese copy style.
- Do not reintroduce a database for podcast content unless the requirement
  changes. Markdown files are the source of truth.
- Keep admin APIs under `/api/admin/*` protected by `getAdminFromContext`.
- Keep Redis as a defensive/cache layer only. Markdown files remain the content
  source of truth.
- Public GET/HEAD pages should keep short cache headers and query stripping so
  random query parameters do not bypass caches.
- Keep staging safe for search engines: `PUBLIC_ALLOW_INDEXING=false` until the
  primary domain is intentionally switched.
- When changing routing or data loading, verify SSR build and a running Node
  server, not just static output.

## Deployment Notes

`docker-compose.prod.yml` expects an externally managed `.env.production` on the
server and mounts the Markdown directory:

```bash
EPISODES_HOST_DIR=/opt/webworker-tech-new/content/episodes
HOST_PORT=4322
```

`scripts/deploy-new-webworker.sh` builds a linux/amd64 image tarball, copies it
to `ssh aliyun`, syncs current Markdown files, starts Compose, and verifies the
remote health endpoint. Use it for the `new.webworker.tech` staging site only;
do not switch the main domain without explicit approval.

Use the official 1Panel skill at `/Users/otto/.agents/skills/1panel-skills` for
website, reverse proxy, DNS verification, and HTTPS operations. Do not hand-edit
OpenResty config unless the 1Panel API is unavailable and that fallback is
explicitly accepted.
