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

| Package           | Why banned                         | Bun-native replacement    |
| ----------------- | ---------------------------------- | ------------------------- |
| `@node-rs/argon2` | NAPI binding incompatible with Bun | `Bun.password`            |
| `argon2`          | NAPI binding incompatible with Bun | `Bun.password`            |
| `bcrypt`          | NAPI binding incompatible with Bun | `Bun.password` (argon2id) |
| `better-sqlite3`  | NAPI binding incompatible with Bun | `bun:sqlite`              |

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

## Spawning processes — `Bun.spawn`

`Bun.spawn` is preferred over `child_process.spawn` for ergonomics and speed. `child_process` still works for compatibility with libraries that depend on it.

## Why this matters

The AI repeatedly generates Bosia user apps that import `@node-rs/argon2`, which **crashes at server startup** under Bun before any route handler runs. Use `Bun.password` from the start.

## Cross-references

- [[bosia-auth-flow]] — uses `Bun.password` for password hashing.
- [[bosia-hooks]] — `event.cookies` for session storage.
- [[bosia-file-upload]] — uses `Bun.Image` for image compression and `Bun.s3` for the S3 storage adapter.
