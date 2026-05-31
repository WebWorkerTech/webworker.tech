# Staging Deploy Checklist

Target staging domain: `new.webworker.tech`.

Keep this domain blocked from crawlers until the main-domain cutover is
approved:

```bash
PUBLIC_ALLOW_INDEXING=false
```

## Server Layout

Recommended paths on `ssh aliyun`:

```text
/opt/webworker-tech-new/
  .env.production
  app/docker-compose.prod.yml
  content/episodes/*.md
```

The Docker container reads Markdown from `/app/content/episodes`, mounted from
`/opt/webworker-tech-new/content/episodes`.

## Environment File

Create `/opt/webworker-tech-new/.env.production`:

```bash
RSS_URL=https://feed.xyzfm.space/rv449dl9kqka
PUBLIC_SITE_URL=https://new.webworker.tech
PUBLIC_ALLOW_INDEXING=false
JWT_SECRET=<long-random-secret>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-redis-password>
REDIS_URL=redis://:<strong-redis-password>@redis:6379
RSS_AUTO_SYNC=true
RSS_AUTO_SYNC_INTERVAL_HOURS=24
HOST_PORT=4322
EPISODES_HOST_DIR=/opt/webworker-tech-new/content/episodes
IMAGE_NAME=webworker-tech:ssr-amd64
```

Prefer `ADMIN_PASSWORD_SHA256` over `ADMIN_PASSWORD` after the first manual
verification if the server process manager makes secret rotation easy.

## Deploy

```bash
sh scripts/deploy-new-webworker.sh
```

The script:

1. Builds the Astro SSR app.
2. Builds a `linux/amd64` Docker image.
3. Copies the image tarball and production compose file to `ssh aliyun`.
4. Syncs local `content/episodes` to the server content directory.
5. Starts Compose and checks `/api/health`.
6. Verifies the remote health endpoint on port `4322`.

Use the local 1Panel API skill for the staging website and reverse proxy:

```bash
export ONEPANEL_BASE_URL='https://<1panel-host>:<port>'
export ONEPANEL_API_KEY='<api-key-from-1panel-settings>'
node /Users/otto/.agents/skills/1panel-skills/dist/scripts/cli.js \
  run websites searchWebsites \
  --input-json '{"page":1,"pageSize":20,"name":"new.webworker.tech","orderBy":"created_at","order":"descending"}'
```

Relevant skill endpoints:

- `POST /websites/search`: find the staging website record.
- `POST /websites`: create the staging website if it does not exist.
- `POST /websites/proxies/update`: create or update reverse proxy to
  `http://127.0.0.1:4322`.
- `POST /websites/nginx/update`: update full Nginx config only when the proxy
  endpoint cannot express the needed headers.
- `POST /websites/ssl` and `POST /websites/:id/https`: issue and attach HTTPS
  after DNS is live.

Do not hand-edit OpenResty config unless the 1Panel API is unavailable and the
fallback is explicitly accepted.

The public URL check is optional because DNS and HTTPS may not be ready during
the first staging deploy:

```bash
PUBLIC_URL=https://new.webworker.tech/ sh scripts/deploy-new-webworker.sh
```

## Verification

Before any primary-domain cutover:

```bash
curl -fsS http://127.0.0.1:4322/api/health
curl -fsS -H 'Host: new.webworker.tech' http://127.0.0.1/robots.txt
curl -fsS -H 'Host: new.webworker.tech' http://127.0.0.1/api/health
```

Before DNS is live, verify from your local machine by forcing the host mapping:

```bash
curl --resolve new.webworker.tech:80:182.92.243.114 \
  http://new.webworker.tech/api/health
curl --resolve new.webworker.tech:80:182.92.243.114 \
  http://new.webworker.tech/robots.txt
```

After the DNS A record points to `182.92.243.114`, issue an HTTPS certificate
for `new.webworker.tech` in 1Panel/OpenResty and then verify:

```bash
curl -fsS https://new.webworker.tech/api/health
curl -fsS https://new.webworker.tech/robots.txt
curl -fsS -I https://new.webworker.tech/admin
```

Expected staging `robots.txt`:

```text
User-agent: *
Disallow: /
```

After login at `/admin`, click `刷新 RSS`. The table should show no new items
immediately after a fresh deploy/sync.
