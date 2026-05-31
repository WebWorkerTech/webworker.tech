# Staging Deploy Checklist

This repository is public. Keep real server IPs, SSH aliases, API keys, 1Panel
tokens, and production environment files outside git.

Use the placeholders below as a template for a private operations note or a
server-side `.env.production` file.

## Staging Rules

Keep non-production domains blocked from crawlers until the primary-domain
cutover is approved:

```bash
PUBLIC_ALLOW_INDEXING=false
```

## Server Layout

Example remote layout:

```text
/srv/webworker-tech/
  .env.production
  app/docker-compose.prod.yml
  content/episodes/*.md
```

The Docker container reads Markdown from `/app/content/episodes`, mounted from
the host content directory.

## Environment File

Create a private server-side environment file, for example
`/srv/webworker-tech/.env.production`:

```bash
RSS_URL=https://example.com/feed.xml
PUBLIC_SITE_URL=https://staging.example.com
PUBLIC_ALLOW_INDEXING=false
JWT_SECRET=<long-random-secret>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-redis-password>
REDIS_URL=redis://:<strong-redis-password>@redis:6379
RSS_AUTO_SYNC=true
RSS_AUTO_SYNC_INTERVAL_HOURS=24
HOST_PORT=4322
EPISODES_HOST_DIR=/srv/webworker-tech/content/episodes
IMAGE_NAME=webworker-tech:ssr-amd64
```

Prefer `ADMIN_PASSWORD_SHA256` over `ADMIN_PASSWORD` when the runtime makes
secret rotation manageable.

## Deploy

Pass private deployment details through environment variables:

```bash
REMOTE_HOST=<ssh-host> \
REMOTE_ROOT=/srv/webworker-tech \
REMOTE_APP_DIR=/srv/webworker-tech/app \
REMOTE_CONTENT_DIR=/srv/webworker-tech/content/episodes \
ENV_FILE=/srv/webworker-tech/.env.production \
PUBLIC_URL=https://staging.example.com/ \
sh scripts/deploy-new-webworker.sh
```

The script:

1. Builds the Astro SSR app.
2. Builds a `linux/amd64` Docker image.
3. Copies the image tarball and production Compose file to the remote host.
4. Syncs local `content/episodes` to the server content directory.
5. Starts Compose and checks `/api/health`.

## Reverse Proxy And HTTPS

Use your private infrastructure tooling or hosting panel to create a reverse
proxy from the public site domain to the app port. Keep API credentials and
panel URLs outside this repository.

Do not hand-edit reverse-proxy config unless your normal management interface is
unavailable and the fallback is intentionally accepted.

## Verification

On the server:

```bash
curl -fsS http://127.0.0.1:4322/api/health
curl -fsS -H 'Host: staging.example.com' http://127.0.0.1/robots.txt
curl -fsS -H 'Host: staging.example.com' http://127.0.0.1/api/health
```

From a local machine before DNS is live, use a private operations note for the
actual IP address:

```bash
curl --resolve staging.example.com:80:<server-ip> \
  http://staging.example.com/api/health
curl --resolve staging.example.com:80:<server-ip> \
  http://staging.example.com/robots.txt
```

After DNS and HTTPS are ready:

```bash
curl -fsS https://staging.example.com/api/health
curl -fsS https://staging.example.com/robots.txt
curl -fsS -I https://staging.example.com/admin
```

Expected staging `robots.txt`:

```text
User-agent: *
Disallow: /
```

After login at `/admin`, click `刷新 RSS`. The table should show no new items
immediately after a fresh deploy/sync.
