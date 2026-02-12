This is a Next.js movie manager app with integrated frontend + backend.

## Features

- Movie CRUD UI (`/`, `/movie-manager`, `/movie-manager/[id]`)
- Internal API routes (`/api/movies`, `/api/movies/[id]`)
- Pagination support for movie listing
- Validation for title and publish year
- SQL persistence with Prisma (PostgreSQL)
- Image upload to Cloudinary
- Custom JWT auth UI (`/signin`, `/signup`) with HTTP-only session cookie

## Structure

- `features/auth/client`: auth provider and route guard for UI
- `features/auth/server`: JWT, cookie session, and create authorization
- `features/movies/server`: movie data store, validation, image upload validation
- `features/movies/client`: movies API client
- `app/api`: thin route handlers delegating to feature modules

## Getting Started

Run commands from `RUN_COMMANDS.md`.

Main command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Notes

- Configure environment variables in `.env` (see `.env.example`).
- Run Prisma migration commands from `RUN_COMMANDS.md` before starting.
- CI/CD setup guide: `GITHUB_ACTIONS_SETUP.md`.
