---
title: Newsletter
description: A newsletter backend — POST /api/newsletter validates emails and stores subscribers via Drizzle, duplicate-safe.
---

The `newsletter` feature gives you the backend for the [`newsletter/centered` and
`newsletter/split` blocks](/docs/blocks/newsletter): a `POST /api/newsletter` endpoint that
validates the email and stores the subscriber via Drizzle. Subscribing twice with the same email
is a success, not an error — safe to expose on a public page.

## Install

```bash
bun x bosia@latest feat newsletter                  # prompts for DB dialect
bun x bosia@latest feat -y newsletter               # auto: sqlite default
bun x bosia@latest feat newsletter -d postgres      # explicit
```

The CLI installs the `drizzle` feature on first use. After install:

```bash
bun run db:generate
bun run db:migrate
```

## What you get

| Path                                                   | Purpose                               |
| ------------------------------------------------------ | ------------------------------------- |
| `src/features/newsletter/schemas/subscribers.table.ts` | Drizzle table (matches your dialect)  |
| `src/features/newsletter/newsletter.service.ts`        | Validation + duplicate-safe create    |
| `src/features/newsletter/subscriber.repository.ts`     | DB queries                            |
| `src/routes/api/newsletter/+server.ts`                 | `POST` subscribe, `GET` list (auth'd) |

## Wire a block

```bash
bun x bosia@latest add block newsletter/centered
```

The block posts to `/api/newsletter` out of the box — no wiring needed. `POST` returns
`201 { "ok": true }` on success (including repeat signups) or `400 { "error": "…" }` on an invalid
email. Emails are lowercased and unique at the database level.

## Reading subscribers

`GET /api/newsletter` returns all subscribers, newest first, and requires a logged-in user
(`locals.user`, from the `auth` feature). No sending ships with this feature — export the
`newsletter_subscribers` table into your email tool, or add a mailer when you're ready to send.
