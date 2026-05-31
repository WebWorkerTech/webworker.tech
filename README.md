# Web Worker Podcast Website

This is the public source repository for the Web Worker podcast website.

The site is an Astro SSR application that renders podcast episodes from local
Markdown files. It includes a small admin workflow for syncing an upstream RSS
feed into those Markdown files. No external database is required for podcast
content.

## Public Repository Notice

This repository is public. Do not commit secrets, server IPs, private SSH host
aliases, API keys, 1Panel tokens, certificate files, or production `.env` files.

Use `.env.example` as a template and keep real environment files outside git.
Private deployment details should live in the server environment, 1Panel, or a
private operations note.

## Stack

- Astro SSR with the Node adapter
- Vue components for interactive UI
- Tailwind CSS
- Markdown files in `content/episodes` as the content source of truth
- Optional Redis for rate limiting and short JSON caches
- Docker Compose for production-style deployment

## Local Development

```bash
pnpm install
pnpm run dev
```

Build and run the SSR server locally:

```bash
pnpm run build
HOST=127.0.0.1 PORT=4322 pnpm run start:ssr
```

The admin page is available at `/admin`. Local credentials come from
environment variables; `.env.example` contains development placeholders only.

## Content

Episodes live in:

```text
content/episodes/*.md
```

To regenerate Markdown files from the legacy JSON snapshot:

```bash
pnpm run import:episodes
```

To preview or import missing RSS episodes:

```bash
pnpm run fetch-rss -- --preview
pnpm run fetch-rss
```

The RSS diff is intentionally simple: local and remote episodes are compared by
normalized title.

## Environment

Important runtime variables:

- `RSS_URL`: upstream podcast RSS feed.
- `EPISODES_DIR`: Markdown episode directory.
- `PUBLIC_SITE_URL`: canonical public site URL.
- `PUBLIC_ALLOW_INDEXING`: set to `false` for staging or test domains.
- `JWT_SECRET`: secret used for admin session tokens.
- `ADMIN_USERNAME`: admin login username.
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_SHA256`: admin login password source.
- `REDIS_URL`: optional Redis URL for shared rate-limit counters and short
  caches.
- `RSS_AUTO_SYNC`: enables periodic RSS import in the Node process.
- `RSS_AUTO_SYNC_INTERVAL_HOURS`: interval for automatic RSS sync.

For public deployments, prefer `ADMIN_PASSWORD_SHA256` over storing a plaintext
admin password when your runtime makes rotation manageable.

## Docker

Check the local Compose config:

```bash
docker compose config
```

Run the app and Redis locally:

```bash
docker compose up --build
```

Check the production-style Compose config with explicit placeholder values:

```bash
JWT_SECRET=dev-secret \
ADMIN_PASSWORD=dev-password \
REDIS_URL=redis://:dev-redis-password@redis.example.internal:6379 \
docker compose -f docker-compose.prod.yml config
```

In Docker, mount the episode directory to `/app/content/episodes`.

Local Compose starts a Redis container for development. Production Compose does
not create Redis; set `REDIS_URL` to an existing private Redis service in the
server environment.

## Deployment

The deployment helper is intentionally parameterized. Pass your own SSH host,
remote paths, and public URL through environment variables:

```bash
REMOTE_HOST=<ssh-host> \
REMOTE_ROOT=/srv/webworker-tech \
REMOTE_APP_DIR=/srv/webworker-tech/app \
REMOTE_CONTENT_DIR=/srv/webworker-tech/content/episodes \
ENV_FILE=/srv/webworker-tech/.env.production \
PUBLIC_URL=https://staging.example.com/ \
sh scripts/deploy-new-webworker.sh
```

The script builds a `linux/amd64` Docker image, copies the image and Compose
file to the remote host, syncs Markdown episode files, starts Compose, and
verifies `/api/health`.

Keep test domains out of search engines with:

```bash
PUBLIC_ALLOW_INDEXING=false
```

## Security

Implemented defensive controls include:

- admin routes protected by session auth
- Origin checks for write endpoints
- rate limiting for public pages, admin login, and RSS admin APIs
- Markdown HTML sanitization before rendering
- short public cache headers for public GET/HEAD pages
- query-string stripping on public pages to reduce cache bypass noise
- optional Redis-backed shared rate-limit counters
- `robots.txt` and `X-Robots-Tag` noindex controls for staging

For heavy abuse or distributed traffic, put the app behind a CDN/WAF or a
reverse proxy with request limits. Redis is not a full-page cache in this app;
it is used for shared counters and short data caches.

## Verification

Useful checks before pushing or deploying:

```bash
pnpm run build
pnpm audit --audit-level moderate
docker compose config
```
