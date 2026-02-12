# Nginx + SSL Auto Setup

Use this script on your EC2 instance after your app is running on port `3000`.

## 1) Make script executable

```bash
chmod +x scripts/setup_nginx_ssl.sh
```

## 2) Domain + SSL (recommended)

Point your domain A record to EC2 public IP first, then run:

```bash
sudo bash scripts/setup_nginx_ssl.sh --domain your-domain.com --email your@email.com
```

## 3) IP-only mode (no SSL)

```bash
sudo bash scripts/setup_nginx_ssl.sh --ip-only
```

## Notes

- Script installs `nginx`, `certbot`, and `python3-certbot-nginx`.
- It configures reverse proxy to `127.0.0.1:3000`.
- For SSL, cert renewal is handled by Certbot system timer automatically.
- For IP-only HTTP deployment set `AUTH_COOKIE_SECURE="false"` in `.env`.
- For domain + HTTPS deployment set `AUTH_COOKIE_SECURE="true"` in `.env`.
- For Dockerized app on a different port, set `APP_PORT`:

```bash
sudo APP_PORT=4000 bash scripts/setup_nginx_ssl.sh --domain your-domain.com --email your@email.com
```
