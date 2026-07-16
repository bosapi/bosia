---
title: Contact Form
description: A contact form backend — POST /api/contact validates submissions and stores them via Drizzle.
---

The `contact-form` feature gives you the backend for the [`contact/split` and `contact/simple`
blocks](/docs/blocks/contact): a `POST /api/contact` endpoint that validates `name`, `email` and
`message`, then stores the submission via Drizzle.

## Install

```bash
bun x bosia@latest feat contact-form                  # prompts for DB dialect
bun x bosia@latest feat -y contact-form               # auto: sqlite default
bun x bosia@latest feat contact-form -d postgres      # explicit
```

The CLI installs the `drizzle` feature on first use. After install:

```bash
bun run db:generate
bun run db:migrate
```

## What you get

| Path                                                     | Purpose                              |
| -------------------------------------------------------- | ------------------------------------ |
| `src/features/contact-form/schemas/submissions.table.ts` | Drizzle table (matches your dialect) |
| `src/features/contact-form/contact.service.ts`           | Validation + create                  |
| `src/features/contact-form/submission.repository.ts`     | DB queries                           |
| `src/routes/api/contact/+server.ts`                      | `POST` submit, `GET` list (auth'd)   |

## Wire a block

```bash
bun x bosia@latest add block contact/split
```

The block posts to `/api/contact` out of the box — no wiring needed. `POST` returns
`201 { "ok": true }` on success or `400 { "error": "…" }` on invalid input.

## Reading submissions

`GET /api/contact` returns all submissions, newest first, and requires a logged-in user
(`locals.user`, from the `auth` feature). No admin UI ships with this feature — query the
`contact_submissions` table directly or build a page on top of `ContactService.getAll()`.

There is no email notification: submissions only land in the database. Add a mailer inside
`ContactService.submit()` if you want an inbox ping per message.
