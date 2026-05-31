#!/usr/bin/env sh
set -eu

IMAGE_NAME="${IMAGE_NAME:-webworker-tech:ssr-amd64}"
TAR_PATH="${TAR_PATH:-/tmp/webworker-tech-deploy/webworker-tech-ssr-amd64.tar}"
BUILD_CACHE_DIR="${BUILD_CACHE_DIR:-/tmp/webworker-tech-deploy/buildx-cache}"
REMOTE_HOST="${REMOTE_HOST:-aliyun}"
REMOTE_ROOT="${REMOTE_ROOT:-/opt/webworker-tech-new}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/opt/webworker-tech-new/app}"
REMOTE_CONTENT_DIR="${REMOTE_CONTENT_DIR:-/opt/webworker-tech-new/content/episodes}"
ENV_FILE="${ENV_FILE:-/opt/webworker-tech-new/.env.production}"
PUBLIC_URL="${PUBLIC_URL-}"
REMOTE_HOST_PORT="${REMOTE_HOST_PORT:-4322}"

wait_for_url() {
  url="$1"
  attempts="${2:-20}"
  delay="${3:-2}"
  i=1
  while [ "$i" -le "$attempts" ]; do
    if curl -fsS -I "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay"
    i=$((i + 1))
  done
  curl -fsS -I "$url" >/dev/null
}

mkdir -p "$(dirname "$TAR_PATH")" "$BUILD_CACHE_DIR"
rm -rf "$BUILD_CACHE_DIR.new"

pnpm run build

docker buildx inspect codex-amd64 >/dev/null 2>&1 || docker buildx create --name codex-amd64 --driver docker-container --use >/dev/null
docker buildx use codex-amd64
docker buildx build \
  --platform linux/amd64 \
  --cache-from "type=local,src=$BUILD_CACHE_DIR" \
  --cache-to "type=local,dest=$BUILD_CACHE_DIR.new,mode=max" \
  -t "$IMAGE_NAME" \
  --output "type=docker,dest=$TAR_PATH" \
  .
rm -rf "$BUILD_CACHE_DIR"
mv "$BUILD_CACHE_DIR.new" "$BUILD_CACHE_DIR"

ssh "$REMOTE_HOST" "mkdir -p '$REMOTE_ROOT' '$REMOTE_APP_DIR' '$REMOTE_CONTENT_DIR'"
rsync -az docker-compose.prod.yml "$REMOTE_HOST:$REMOTE_APP_DIR/docker-compose.prod.yml"
rsync -az content/episodes/ "$REMOTE_HOST:$REMOTE_CONTENT_DIR/"
rsync -az "$TAR_PATH" "$REMOTE_HOST:$REMOTE_ROOT/$(basename "$TAR_PATH")"

ssh "$REMOTE_HOST" "
set -eu
cd '$REMOTE_APP_DIR'
docker load -i '$REMOTE_ROOT/$(basename "$TAR_PATH")'
EPISODES_HOST_DIR='$REMOTE_CONTENT_DIR' IMAGE_NAME='$IMAGE_NAME' docker compose --env-file '$ENV_FILE' -f docker-compose.prod.yml up -d
for i in \$(seq 1 20); do
  if curl -fsS http://127.0.0.1:$REMOTE_HOST_PORT/api/health >/dev/null 2>&1; then
    exit 0
  fi
  sleep 2
done
curl -fsS http://127.0.0.1:$REMOTE_HOST_PORT/api/health >/dev/null
"

if [ -n "$PUBLIC_URL" ]; then
  wait_for_url "$PUBLIC_URL" 20 2
  echo "Deploy verified: $PUBLIC_URL"
else
  echo "Deploy verified on remote port: $REMOTE_HOST_PORT"
fi
