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

## Spawning processes — `Bun.spawn`

`Bun.spawn` is preferred over `child_process.spawn` for ergonomics and speed. `child_process` still works for compatibility with libraries that depend on it.

## Why this matters

The AI repeatedly generates Bosia user apps that import `@node-rs/argon2`, which **crashes at server startup** under Bun before any route handler runs. Use `Bun.password` from the start.

## Cross-references

- [[bosia-auth-flow]] — uses `Bun.password` for password hashing.
- [[bosia-hooks]] — `event.cookies` for session storage.
