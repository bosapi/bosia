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

Bosia runs on Bun, not Node. Several popular Node packages ship NAPI native bindings that crash at import under Bun. Use Bun-native APIs instead. (The AI repeatedly generates apps that import `@node-rs/argon2`, which crashes at server startup before any handler runs — use `Bun.password` from the start.)

## Password hashing — `Bun.password` (built in, no install)

```ts
// src/features/auth/password.ts
export const hashPassword = (pw: string) =>
	Bun.password.hash(pw, { algorithm: "argon2id", memoryCost: 19456, timeCost: 2 }); // ~19 MiB
export const verifyPassword = (pw: string, hash: string) => Bun.password.verify(pw, hash);
```

## Banned packages (never import or install)

- `@node-rs/argon2`, `argon2`, `bcrypt` → `Bun.password` (argon2id)
- `better-sqlite3` → `bun:sqlite`
- `postgres` (postgres.js), `pg` → `Bun.SQL` + `drizzle-orm/bun-sql`
- `@aws-sdk/client-s3`, `aws4fetch` → `Bun.s3`

Any of these in a Bosia app's `package.json` is a bug — replace with the Bun-native API.

## File reads — `Bun.file`

`await Bun.file(p).text()` / `.json()` / `.bytes()`. Faster than `node:fs/promises`, avoids buffering.

## Image processing — `Bun.Image` (constructor, not a factory)

No `Bun.Image.open()`/`.decode()` (they throw). Construct with `new`; read dims from `metadata()` (NOT `.width`/`.height` → `-1`); resize positionally; encode per-format; finalize with `.bytes()`.

```ts
const img = new Bun.Image(await Bun.file("./input.png").bytes());
const { width, height } = await img.metadata();
const out = await img.resize(1920, 1080, { fit: "inside" }).webp({ quality: 85 }).bytes(); // quality 0–100 int
await Bun.write("./out.webp", out);
```

Encoders: `.webp/.jpeg/.avif/.heic({ quality })`, `.png()`. Also `rotate/flip/flop/modulate/blob/buffer/toBase64/dataurl/write`.
❌ `Bun.Image.open/decode`, `img.width`, `img.resize({ width })`, `quality: 0.85`.

## S3 — `Bun.s3` (built in, S3-compatible: AWS/MinIO/R2/B2/Spaces/Wasabi)

```ts
await Bun.s3.file("avatars/u-42.webp", { bucket: "uploads", type: "image/webp" }).write(bytes);
const bytes = await Bun.s3.file("avatars/u-42.webp", { bucket: "uploads" }).bytes();
await Bun.s3.file("avatars/u-42.webp", { bucket: "uploads" }).delete();
const url = Bun.s3.presign("avatars/u-42.webp", { bucket: "uploads", expiresIn: 900 });
```

Env: `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_BUCKET`, `S3_ENDPOINT` (override per call, or `new Bun.S3Client({...})`). Do NOT invent an `S3_URL` DSN — not a standard; use the discrete vars. See `registry/features/file-upload/storage-s3.ts`, [[bosia-file-upload]] R3, https://bun.com/docs/runtime/s3.

## Postgres — `Bun.SQL` + `drizzle-orm/bun-sql`

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

Gotcha (Bun 1.3.x): the URL-string form `new Bun.SQL("postgres://...")` throws `FailedToOpenSocket` even on a valid URL — use the object form above (`registry/features/drizzle/drizzle-index.pg.ts` parses `DATABASE_URL` for this reason).

Gotcha — intermittent `Failed query` in the dev server that a fresh `bun run`/`db_query` can't reproduce: `Failed query: <sql>` is Drizzle's generic wrapper; the real error is in `err.cause`, almost always `PostgresError: Connection closed`. The long-lived client kept a pooled socket open with default `idleTimeout: 0` (never close); Postgres / the lima port-forward reaped the idle socket but Bun ran the next query on the dead one. Fresh-process tools get a new connection → can't repro (don't conclude "the DB is fine"). Fix: set `idleTimeout`/`maxLifetime` as above. Always read `err.cause` before investigating the SQL.

Env: `DATABASE_URL=postgres://user:pass@host:5432/db`.

## Spawning — `Bun.spawn`

Preferred over `child_process.spawn`; `child_process` still works for libs that need it.

Related: [[bosia-auth-flow]] (Bun.password), [[bosia-hooks]] (`event.cookies`), [[bosia-file-upload]] (Bun.Image, Bun.s3).
