#!/usr/bin/env bash

set -euo pipefail

# Auto-configure Nginx reverse proxy for Next.js and enable SSL with Certbot
# when a domain is provided.
#
# Usage:
#   sudo bash scripts/setup_nginx_ssl.sh --domain app.example.com --email you@example.com
#   sudo bash scripts/setup_nginx_ssl.sh --ip-only
#
# Defaults:
#   APP_PORT=3000
#   APP_SCHEME=http

APP_PORT="${APP_PORT:-3000}"
APP_SCHEME="${APP_SCHEME:-http}"
SITE_NAME="movie-wallet"
NGINX_CONF_PATH="/etc/nginx/sites-available/${SITE_NAME}"
NGINX_ENABLED_PATH="/etc/nginx/sites-enabled/${SITE_NAME}"

DOMAIN=""
EMAIL=""
IP_ONLY="false"

usage() {
  cat <<EOF
Usage:
  sudo bash scripts/setup_nginx_ssl.sh --domain <fqdn> --email <email>
  sudo bash scripts/setup_nginx_ssl.sh --ip-only

Options:
  --domain   Public domain name (e.g. app.example.com)
  --email    Email for Let's Encrypt notifications
  --ip-only  Configure HTTP-only Nginx for server IP (no SSL)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)
      DOMAIN="${2:-}"
      shift 2
      ;;
    --email)
      EMAIL="${2:-}"
      shift 2
      ;;
    --ip-only)
      IP_ONLY="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Please run as root (use sudo)."
  exit 1
fi

if [[ "${IP_ONLY}" == "false" ]]; then
  if [[ -z "${DOMAIN}" || -z "${EMAIL}" ]]; then
    echo "For SSL mode, both --domain and --email are required."
    exit 1
  fi
fi

echo "Installing Nginx and Certbot packages..."
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx

echo "Creating Nginx config..."
if [[ "${IP_ONLY}" == "true" ]]; then
  cat > "${NGINX_CONF_PATH}" <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass ${APP_SCHEME}://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
}
EOF
else
  cat > "${NGINX_CONF_PATH}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    client_max_body_size 10M;

    location / {
        proxy_pass ${APP_SCHEME}://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
}
EOF
fi

if [[ ! -L "${NGINX_ENABLED_PATH}" ]]; then
  ln -s "${NGINX_CONF_PATH}" "${NGINX_ENABLED_PATH}"
fi

if [[ -e /etc/nginx/sites-enabled/default ]]; then
  rm -f /etc/nginx/sites-enabled/default
fi

nginx -t
systemctl enable nginx
systemctl restart nginx

if [[ "${IP_ONLY}" == "false" ]]; then
  echo "Requesting Let's Encrypt certificate for ${DOMAIN}..."
  certbot --nginx --non-interactive --agree-tos --email "${EMAIL}" -d "${DOMAIN}" --redirect
  nginx -t
  systemctl reload nginx
  echo "SSL enabled successfully for ${DOMAIN}."
else
  echo "IP-only mode configured (HTTP only)."
fi

echo "Done."
