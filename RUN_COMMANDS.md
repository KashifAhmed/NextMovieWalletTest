# Run Commands

Run these commands manually from the project root:

`/home/kashif-ahmed/development/nextjs-movie-wallet/movie-wallet`

## 1) Install dependencies

```bash
npm install
```

## 2) Start PostgreSQL with Docker

```bash
docker compose up -d
docker compose ps
```

## 3) Create environment file

```bash
cp .env.example .env
```

Then edit `.env` and set your Cloudinary credentials:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Required for auth flow:

- `JWT_SECRET` (any strong secret string)

## 4) Prisma SQL setup (PostgreSQL)

Set `DATABASE_URL` in `.env` first, for example:

```bash
DATABASE_URL="postgresql://movie_wallet:movie_wallet_password@localhost:5435/movie_wallet?schema=public"
```

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init_movies
```

## 5) Start development server

```bash
npm run dev
```

## 6) Lint and build checks

```bash
npm run lint
npm run build
```

## 7) Optional API quick tests (new terminal)

```bash
curl -X POST http://localhost:3000/api/movies \
  -b cookies.txt \
  -F "title=Inception" \
  -F "publishYear=2010" \
  -F "image=@/absolute/path/to/poster.jpg"

curl "http://localhost:3000/api/movies?page=1&limit=8"
```

After creating a movie, replace `<movie-id>` and test update/delete:

```bash
curl -X PATCH http://localhost:3000/api/movies/<movie-id> \
  -F "title=Inception (Updated)" \
  -F "publishYear=2011" \
  -F "image=@/absolute/path/to/new-poster.jpg"

curl -X DELETE http://localhost:3000/api/movies/<movie-id>
```

Create auth session cookie via API:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt
```

## 8) Stop database container (when needed)

```bash
docker compose down
```

## 9) Configure Nginx + SSL on EC2

```bash
chmod +x scripts/setup_nginx_ssl.sh
sudo bash scripts/setup_nginx_ssl.sh --domain your-domain.com --email your@email.com
```

For IP-only (no SSL):

```bash
sudo bash scripts/setup_nginx_ssl.sh --ip-only
```
