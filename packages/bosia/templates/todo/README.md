# {{PROJECT_NAME}}

A fullstack app built with [Bosia](https://github.com/bosapi/bosia) + Drizzle ORM + PostgreSQL.

## Prerequisites

- [Bun](https://bun.sh/) v1.1+
- [PostgreSQL](https://www.postgresql.org/) running locally or remotely

## Getting Started

```bash
# Copy env and set your DATABASE_URL
cp .env.example .env

# Push schema to database
bun run db:push

# Seed initial data
bun run db:seed

# Start dev server
bun x bosia dev
```

Visit [http://localhost:9000](http://localhost:9000) to see the app.

## Scripts

| Command               | Description                            |
| --------------------- | -------------------------------------- |
| `bun x bosia dev`     | Start dev server with HMR              |
| `bun x bosia build`   | Production build                       |
| `bun x bosia start`   | Start production server                |
| `bun run db:generate` | Generate migration from schema changes |
| `bun run db:migrate`  | Apply pending migrations               |
| `bun run db:push`     | Push schema directly (dev shortcut)    |
| `bun run db:studio`   | Open Drizzle Studio GUI                |
| `bun run db:seed`     | Run pending seed files                 |

## Project Structure

```
src/
├── features/
│   ├── drizzle/          # DB infrastructure
│   │   ├── index.ts      # Connection singleton
│   │   ├── schemas.ts    # Schema aggregator
│   │   ├── migrations/   # Drizzle Kit output
│   │   └── seeds/        # Seed files + runner
│   └── todo/             # Business feature
│       ├── schemas/      # Table definitions
│       ├── queries.ts    # Typed CRUD
│       └── types.ts      # Inferred types
├── lib/components/todo/  # UI components
└── routes/
    ├── todos/            # CRUD page with form actions
    └── api/todos/        # REST API
```

## Adding Features

```bash
# Add DB support to any Bosia app
bosia feat drizzle

# Add the todo feature (requires drizzle)
bosia feat todo
```
