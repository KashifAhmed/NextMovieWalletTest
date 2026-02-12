# GitHub Actions CI/CD Setup

This project now has:

- CI workflow: `.github/workflows/ci.yml`
- Auto deploy workflow: `.github/workflows/deploy.yml`
- Server deploy script: `scripts/deploy_on_server.sh`

## 1) Required GitHub repository secrets

Add these in GitHub repo -> Settings -> Secrets and variables -> Actions:

- `EC2_HOST` - EC2 public IP or domain
- `EC2_USER` - SSH user (example: `ubuntu`)
- `EC2_SSH_KEY` - private key content (`-----BEGIN ...`)
- `APP_DIR` - absolute app path on server (example: `/home/ubuntu/movie-wallet`)

Optional:

- `EC2_PORT` - SSH port (default `22`)

## 2) Prepare server one time

Run these once on EC2:

```bash
sudo apt-get update -y
sudo apt-get install -y git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

Clone your repo to the same path as `APP_DIR`, then set `.env`.

## 3) How deployment works

- Push to `main`
- CI runs lint + build (tests are intentionally not run on server)
- If CI passes, deploy workflow SSHs into EC2
- Server script runs:
  - `git pull`
  - `npm ci`
  - `prisma generate`
  - `prisma migrate deploy`
  - `npm run build`
  - restart app with PM2
  - `/api/health` check
  - automatic rollback to previous commit if health check fails

## 4) Recommended GitHub environment protection

Create a GitHub Environment named `production` and set required reviewers.
The deploy workflow already targets this environment.

## 5) First manual start (recommended once)

```bash
cd /home/ubuntu/movie-wallet
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 start npm --name movie-wallet -- start
pm2 save
```
