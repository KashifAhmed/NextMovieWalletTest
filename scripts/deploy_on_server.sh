#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/movie-wallet}"
APP_NAME="${APP_NAME:-movie-wallet}"
BRANCH="${BRANCH:-main}"

echo "Deploying ${APP_NAME} from branch ${BRANCH}"
echo "App directory: ${APP_DIR}"

cd "${APP_DIR}"

git fetch --all --prune
git checkout "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

npm ci
npx prisma generate
npx prisma migrate deploy
npm run build

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 restart "${APP_NAME}" --update-env
else
  pm2 start npm --name "${APP_NAME}" -- start
fi

pm2 save
echo "Deployment complete."
