# Web Worker Podcast

Astro SSR version of the Web Worker podcast website.

The site renders from local Markdown files in `content/episodes`, so the
deployed container does not need an external database. The admin page can fetch
the upstream RSS feed, compare items by title, and import new episodes as
Markdown.

## Local Development

```bash
pnpm install
pnpm run dev
```

Build and run the SSR server:

```bash
pnpm run build
HOST=127.0.0.1 PORT=4322 pnpm run start:ssr
```

Admin defaults for local development:

- URL: `/admin`
- Username: `admin`
- Password: `change-me`

## Content

Episodes live in `content/episodes/*.md`. To regenerate the initial Markdown
files from the legacy JSON snapshot:

```bash
pnpm run import:episodes
```

Preview or import new remote RSS items into Markdown:

```bash
pnpm run fetch-rss -- --preview
pnpm run fetch-rss
```

In Docker, mount the episode directory to `/app/content/episodes`.

Redis is optional. It is used only for rate limiting and short JSON caches; the
Markdown files remain the source of truth. Local Docker starts Redis
automatically. Production Compose also starts an internal Redis service; set
`REDIS_PASSWORD` and `REDIS_URL=redis://:<password>@redis:6379` in the server
environment file.

## Staging Deployment

Use `new.webworker.tech` as the staging domain. Keep indexing disabled:

```bash
PUBLIC_ALLOW_INDEXING=false
```

Production-style Compose config:

```bash
docker compose -f docker-compose.prod.yml config
```

Deploy helper for the Aliyun host:

```bash
sh scripts/deploy-new-webworker.sh
```

The deploy script builds a linux/amd64 Docker image, uploads it to `ssh aliyun`,
syncs `content/episodes`, starts Compose, and verifies the remote health
endpoint on port `4322`. After DNS and HTTPS are ready, pass
`PUBLIC_URL=https://new.webworker.tech/` to verify the public URL as well.

Use the local 1Panel API skill for website, reverse proxy, DNS verification, and
HTTPS work. Do not hand-edit OpenResty config unless the 1Panel API is
unavailable and the fallback is explicitly accepted.
