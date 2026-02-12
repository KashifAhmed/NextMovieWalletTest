#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/movie-wallet}"
APP_NAME="${APP_NAME:-movie-wallet}"
BRANCH="${BRANCH:-main}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3000/api/health}"
HEALTHCHECK_RETRIES="${HEALTHCHECK_RETRIES:-20}"
HEALTHCHECK_DELAY_SECONDS="${HEALTHCHECK_DELAY_SECONDS:-3}"

echo "Deploying ${APP_NAME} from branch ${BRANCH}"
echo "App directory: ${APP_DIR}"

cd "${APP_DIR}"

PREV_SHA="$(git rev-parse HEAD)"
echo "Previous commit: ${PREV_SHA}"

rollback() {
  echo "Deployment failed. Rolling back to ${PREV_SHA}..."
  git reset --hard "${PREV_SHA}"
  npm ci
  npx prisma generate
  npm run build
  pm2 restart "${APP_NAME}" --update-env || true
  pm2 save || true
}

if ! git fetch --all --prune || ! git checkout "${BRANCH}" || ! git pull --ff-only origin "${BRANCH}"; then
  rollback
  exit 1
fi

if ! npm ci || ! npx prisma generate || ! npx prisma migrate deploy || ! npm run build; then
  rollback
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 restart "${APP_NAME}" --update-env
else
  pm2 start npm --name "${APP_NAME}" -- start
fi

pm2 save

echo "Running health check: ${HEALTHCHECK_URL}"
for ((i=1; i<=HEALTHCHECK_RETRIES; i++)); do
  if curl -fsS "${HEALTHCHECK_URL}" >/dev/null; then
    echo "Health check passed."
    echo "Deployment complete."
    exit 0
  fi
  echo "Health check attempt ${i}/${HEALTHCHECK_RETRIES} failed. Retrying..."
  sleep "${HEALTHCHECK_DELAY_SECONDS}"
done

echo "Health check failed after ${HEALTHCHECK_RETRIES} attempts."
rollback
exit 1
