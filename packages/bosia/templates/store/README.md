# {{PROJECT_NAME}}

An online-store starter built with [Bosia](https://github.com/bosapi/bosia) — Postgres database, MinIO (S3) uploads, auth, RBAC, and the shop domain (products / orders / cart).

## Prerequisites

- [Bun](https://bun.sh/) v1.1+
- PostgreSQL running locally or remotely
- An S3-compatible bucket (AWS S3, Cloudflare R2, MinIO, ...)

## Getting Started

```bash
cp .env.example .env
# fill DATABASE_URL, SESSION_SECRET, and S3_* in .env

bun run db:generate
bun run db:migrate
bun run db:seed

bun x bosia dev
```

Visit [http://localhost:9000](http://localhost:9000). The **first account you register becomes the admin** (gets `('*','*')` via the RBAC bootstrap seed).

## What ships

| Feature       | Path                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| `auth`        | `src/features/auth/`, `(public)/login`, `(public)/register`, `/logout` |
| `rbac`        | `src/features/rbac/`, `locals.can(r,a,scope?)`                         |
| `file-upload` | `src/features/file-upload/`, `POST /api/files` (S3 via `Bun.s3`)       |
| `shop`        | `src/features/shop/` (products / orders / cart services)               |

## Routes

- `/` — public landing
- `/login`, `/register`, `POST /logout`
- `/dashboard` — gated; redirects to `/login` if unauthenticated

## Scripts

| Command               | Description                                   |
| --------------------- | --------------------------------------------- |
| `bun x bosia dev`     | Dev server with HMR                           |
| `bun x bosia build`   | Production build                              |
| `bun run db:generate` | Generate migration from schema changes        |
| `bun run db:migrate`  | Apply pending migrations                      |
| `bun run db:seed`     | Run pending seed files (incl. RBAC bootstrap) |

## S3 storage

Uses native `Bun.s3` (no `@aws-sdk/*` dependency). Defaults target a local MinIO; point `S3_ENDPOINT` at any S3-compatible store (AWS S3, Cloudflare R2, ...):

```
STORAGE_DRIVER=s3
S3_BUCKET=uploads
S3_REGION=auto
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_ENDPOINT=http://localhost:9000   # MinIO; omit for AWS S3
```
