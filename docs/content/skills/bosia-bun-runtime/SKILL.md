---
name: bosia-bun-runtime
description: Bun-native APIs replacing Node packages that crash under Bun. Use Bun.password (NOT @node-rs/argon2, argon2, bcrypt). Bun.file for fs reads. Banned NAPI packages list. Covers password hashing, hashing config, common Node→Bun substitutions.
triggers:
  - password hashing
  - argon2
  - bcrypt
  - Bun.password
  - native module
  - NAPI
  - node-rs
  - hash password
od:
  mode: convention
  category: runtime
bosia:
  design: false
  requires:
    blocks: []
    themes: []
    components: []
    feats: []
  targets:
    routes: []
  stack: [bun]
---

# bosia-bun-runtime

## What it is

Bosia runs on Bun, not Node. Several popular Node packages ship NAPI native bindings that **crash at import** under Bun. Use Bun-native APIs instead.

## Password hashing — use `Bun.password`

```ts
// src/features/auth/password.ts
export async function hashPassword(pw: string): Promise<string> {
	return await Bun.password.hash(pw, {
		algorithm: "argon2id",
		memoryCost: 19456, // ~19 MiB
		timeCost: 2,
	});
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
	return await Bun.password.verify(pw, hash);
}
```

`Bun.password` is built in — no install, no native modules, no NAPI breakage. Algorithm defaults to `argon2id`.

## Banned packages (do not import or install)

| Package           | Why banned                                             | Bun-native replacement            |
| ----------------- | ------------------------------------------------------ | --------------------------------- |
| `@node-rs/argon2` | NAPI binding incompatible with Bun                     | `Bun.password`                    |
| `argon2`          | NAPI binding incompatible with Bun                     | `Bun.password`                    |
| `bcrypt`          | NAPI binding incompatible with Bun                     | `Bun.password` (argon2id)         |
| `better-sqlite3`  | NAPI binding incompatible with Bun                     | `bun:sqlite`                      |
| `postgres`        | Userland Postgres driver — `Bun.SQL` already covers it | `Bun.SQL` + `drizzle-orm/bun-sql` |
| `pg`              | node-postgres NAPI bindings; redundant with `Bun.SQL`  | `Bun.SQL` + `drizzle-orm/bun-sql` |

If you see any of these in `package.json` of a Bosia user app, that's a bug — replace with the Bun-native API.

## File reads — prefer `Bun.file`

```ts
const text = await Bun.file("./path.txt").text();
const json = await Bun.file("./data.json").json();
const bytes = await Bun.file("./blob.bin").bytes();
```

Faster than `node:fs/promises` and avoids unnecessary buffering.

## Image processing — `Bun.Image`

`Bun.Image` is a **constructor**, not a static factory. There is no `Bun.Image.open()` or `Bun.Image.decode()` — calling them throws. Construct with `new`, read dimensions from `metadata()` (not `.width` / `.height` — those return `-1`), resize positionally, encode via per-format methods, finalize with `.bytes()`.

```ts
const bytes = await Bun.file("./input.png").bytes();
const img = new Bun.Image(bytes);

const { width, height } = await img.metadata();

const out = await img
	.resize(1920, 1080, { fit: "inside" }) // positional (w, h, opts)
	.webp({ quality: 85 }) // quality is 0–100 integer, NOT 0–1
	.bytes();

await Bun.write("./out.webp", out);
```

Per-format encoders: `.webp({ quality })`, `.jpeg({ quality })`, `.png()`, `.avif({ quality })`, `.heic({ quality })`. Other instance methods: `rotate`, `flip`, `flop`, `modulate`, `blob`, `buffer`, `toBase64`, `dataurl`, `write`.

❌ Wrong: `Bun.Image.open(bytes)`, `Bun.Image.decode(bytes)`, `img.width`, `img.resize({ width, height })`, `img.encode({ format: "webp", quality: 0.85 })`.

## S3 — `Bun.s3`

Bun ships a built-in S3 client. **Do not install `@aws-sdk/client-s3` or `aws4fetch`** — `Bun.s3` covers upload, download, delete, and presign with zero deps. It speaks the S3 protocol, so any S3-compatible backend works: AWS S3, **MinIO**, Cloudflare R2, Backblaze B2, DigitalOcean Spaces, Wasabi.

```ts
// upload
await Bun.s3.file("avatars/u-42.webp", { bucket: "uploads", type: "image/webp" }).write(bytes);

// download
const bytes = await Bun.s3.file("avatars/u-42.webp", { bucket: "uploads" }).bytes();

// delete
await Bun.s3.file("avatars/u-42.webp", { bucket: "uploads" }).delete();

// presigned URL (15 min default)
const url = Bun.s3.presign("avatars/u-42.webp", { bucket: "uploads", expiresIn: 900 });
```

Credentials and endpoint come from env: `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_BUCKET`, `S3_ENDPOINT`. Override per call by passing `accessKeyId`/`secretAccessKey`/`endpoint`/`region` in the options object, or construct a scoped client with `new Bun.S3Client({...})` and reuse it.

**Do not invent a `S3_URL` DSN.** It is not a standard (AWS SDK, Bun, rclone, mc all use discrete vars); a fake one will mislead future AI agents. Stick to the names above.

Bosia's `file-upload` feature uses `Bun.s3` directly — see `registry/features/file-upload/storage-s3.ts` and [[bosia-file-upload]] R3 for MinIO/R2/AWS endpoint examples. Full API: https://bun.com/docs/runtime/s3.

## Postgres — `Bun.SQL`

Bun ships a built-in Postgres client. **Do not install `postgres` (postgres.js) or `pg` (node-postgres).** Drizzle adapts directly to it via `drizzle-orm/bun-sql`.

```ts
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schemas";

const u = new URL(process.env.DATABASE_URL!);
const client = new Bun.SQL({
	hostname: u.hostname,
	port: u.port ? Number(u.port) : 5432,
	user: u.username ? decodeURIComponent(u.username) : undefined,
	password: u.password ? decodeURIComponent(u.password) : undefined,
	database: u.pathname.slice(1) || undefined,
	idleTimeout: 20, // close idle sockets before the server reaps them
	maxLifetime: 60 * 30,
	connectionTimeout: 30,
});

export const db = drizzle(client, { schema });
```

**Gotcha (Bun 1.3.x):** `new Bun.SQL("postgres://...")` (URL-string form) throws `FailedToOpenSocket` even on a valid URL. Use the **object form** above. The framework's `registry/features/drizzle/drizzle-index.pg.ts` parses `DATABASE_URL` for exactly this reason. Track upstream — when Bun ships the URL-string fix, the parse step can be dropped.

**Gotcha — `Failed query` that works in a fresh process but fails in the dev server:** If a query (login, register, any read) intermittently throws `Failed query: select ...` while the same SQL runs fine via `db_query` / a one-off `bun run` script, the cause is **not** the query. `Failed query: <sql>\nparams: <...>` is Drizzle's generic `DrizzleQueryError` wrapper — the real error lives in `err.cause`, almost always `PostgresError: Connection closed`. The single long-lived `Bun.SQL` client kept a pooled socket open with the default `idleTimeout: 0` (never close); Postgres or the lima port-forward reaped that idle socket, but Bun still treated it as live, so the next query ran on a dead socket. Every debugging tool that spawns a fresh process gets a brand-new connection and therefore **cannot reproduce it** — do not conclude "the DB is fine." Fix: set `idleTimeout` (and `maxLifetime`) on the client as shown above so Bun closes idle sockets first and reconnects on demand. When you see `Failed query`, always read `err.cause` before investigating the SQL.

**Credentials env:** `DATABASE_URL=postgres://user:pass@host:5432/db`. No `postgres` package needed.

## Spawning processes — `Bun.spawn`

`Bun.spawn` is preferred over `child_process.spawn` for ergonomics and speed. `child_process` still works for compatibility with libraries that depend on it.

## Why this matters

The AI repeatedly generates Bosia user apps that import `@node-rs/argon2`, which **crashes at server startup** under Bun before any route handler runs. Use `Bun.password` from the start.

## Cross-references

- [[bosia-auth-flow]] — uses `Bun.password` for password hashing.
- [[bosia-hooks]] — `event.cookies` for session storage.
- [[bosia-file-upload]] — uses `Bun.Image` for image compression and `Bun.s3` for the S3 storage adapter.
