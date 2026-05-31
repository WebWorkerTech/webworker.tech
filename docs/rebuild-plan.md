# SSR Markdown Rebuild Plan

This is the working plan for converting the podcast site from a manually
updated static build into a Node + Astro SSR service.

## Target State

- Astro runs in SSR mode through `@astrojs/node`.
- Podcast episodes are local Markdown files in `content/episodes`.
- Docker mounts the Markdown directory from the host, so content survives image
  replacement.
- The admin UI can log in, preview RSS differences by title, and import missing
  RSS items as Markdown.
- A background scheduler can import missing RSS items daily.
- Staging uses a non-production domain, port `4322`, robots disallow, and
  noindex headers/meta until primary-domain cutover is explicitly approved.
- The primary domain is not changed by staging deploy scripts.

## Current Implementation

- SSR pages read Markdown through `src/server/episodes.ts`.
- RSS preview/import is implemented in `src/server/rss.ts` and `/api/admin/rss/*`.
- CLI RSS sync is available through `pnpm run fetch-rss`.
- Docker production compose uses host port `4322` by default.
- `scripts/deploy-new-webworker.sh` builds a linux/amd64 image and starts the
  remote service on a parameterized SSH host.
- Reverse proxy, DNS checks, and HTTPS should be handled through private
  infrastructure tooling rather than hard-coded public repository details.

## Deployment Phases

1. Local verification
   - `pnpm run fetch-rss -- --preview`
   - `pnpm run build`
   - `JWT_SECRET=test ADMIN_PASSWORD=test HOST_PORT=4322 docker compose -f docker-compose.prod.yml config`

2. Staging container
   - Create a private `.env.production` on the remote host.
   - Run `REMOTE_HOST=<ssh-host> ENV_FILE=<remote-env-file> sh scripts/deploy-new-webworker.sh`.
   - Verify `http://127.0.0.1:4322/api/health` on the server.

3. Staging reverse proxy
   - Configure private hosting-panel or reverse-proxy credentials outside git.
   - Create or update the staging reverse proxy to the SSR container port.
   - Verify with `curl --resolve staging.example.com:80:<server-ip>`.
   - Add DNS A record for the staging domain to the server IP.
   - Issue HTTPS certificate after DNS is live.

4. Main-domain cutover
   - Only after explicit approval.
   - Repoint the existing primary-domain proxy to the SSR container.
   - Keep rollback path by preserving the old container and config.
   - Turn on indexing only after production verification.

## Known Boundaries

- The RSS diff is intentionally title-based for now.
- Markdown files are the content source of truth; `src/data/podcast-data.json`
  is only a legacy import seed.
- DNS automation is not wired in this repository yet. If Tencent Cloud/DNSPod
  credentials or a connector become available, add it as a separate deployment
  step rather than mixing it into the app runtime.
