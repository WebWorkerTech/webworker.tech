# CLAUDE.md

This file intentionally mirrors the current project guidance in `AGENTS.md`.
The old static-HTML instructions were removed because this repository is now an
Astro SSR podcast site backed by local Markdown files.

## Current Architecture

- Astro 5 runs in `@astrojs/node` standalone SSR mode.
- Vue components provide client interaction where needed.
- Podcast content is read from `content/episodes/*.md`.
- `/admin` authenticates with environment-configured credentials.
- Admin RSS sync compares remote RSS items against local Markdown by title and
  imports new items as Markdown.
- Docker mounts the episode directory as persistent local content; no database
  is required for podcast data.

## Commands

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run import:episodes
pnpm run fetch-rss
docker compose config
docker compose up --build
```

`pnpm run fetch-rss` now syncs RSS items into Markdown files. It does not write
to `src/data/podcast-data.json`.

## Deployment Notes

- Staging domain: `new.webworker.tech`.
- Staging host port: `4322`.
- Keep `PUBLIC_ALLOW_INDEXING=false` for staging.
- Do not switch the primary domain without explicit approval.
- DNS, reverse proxy, and HTTPS are separate from container deployment. Use the
  official 1Panel skill at `/Users/otto/.agents/skills/1panel-skills` for those
  operations instead of hand-editing OpenResty config.
