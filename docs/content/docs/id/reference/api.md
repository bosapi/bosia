---
title: Referensi API
description: Semua fungsi dan tipe yang diekspor dari paket bosia.
---

Semua diimpor dari `"bosia"`:

```ts
import { cn, sequence, error, redirect, fail } from "bosia";
import type { RequestEvent, LoadEvent, Handle, Cookies } from "bosia";
```

## Fungsi

### cn(...inputs)

Gabungkan class Tailwind CSS dengan aman. Menggunakan penggabungan class bawaan dan [tailwind-merge](https://github.com/dcastil/tailwind-merge).

```ts
cn("px-4 py-2", "px-6")          // → "py-2 px-6"
cn("text-red-500", isActive && "text-blue-500")
```

### sequence(...handlers)

Susun beberapa middleware `Handle` menjadi satu handler tunggal:

```ts
export const handle = sequence(auth, logging, rateLimit);
```

Handler dieksekusi dari kiri ke kanan. `resolve` pada setiap handler memanggil handler berikutnya.

### error(status, message)

Lempar error HTTP dari fungsi `load()`. Merender `+error.svelte` terdekat.

```ts
error(404, "Post not found");     // never returns
```

### redirect(status, location)

Redirect dari fungsi `load()` atau form action.

```ts
redirect(303, "/login");          // never returns
```

### fail(status, data)

Kembalikan kegagalan validasi dari form action. **Dikembalikan**, bukan dilempar.

```ts
return fail(400, { email, errors: { email: "Required" } });
```

## Tipe

### RequestEvent

Tersedia di rute API (`+server.ts`) dan form actions.

```ts
type RequestEvent = {
  request: Request;
  url: URL;
  locals: Record<string, any>;
  params: Record<string, string>;
  cookies: Cookies;
};
```

### LoadEvent

Tersedia di fungsi `load()` dalam `+page.server.ts` dan `+layout.server.ts`.

```ts
type LoadEvent = {
  url: URL;
  params: Record<string, string>;
  locals: Record<string, any>;
  cookies: Cookies;
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  parent: () => Promise<Record<string, any>>;
  metadata: Record<string, any> | null;
};
```

### MetadataEvent

Tersedia di fungsi `metadata()` dalam `+page.server.ts`.

```ts
type MetadataEvent = {
  params: Record<string, string>;
  url: URL;
  locals: Record<string, any>;
  cookies: Cookies;
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};
```

### Metadata

Tipe kembalian untuk fungsi `metadata()`.

```ts
type Metadata = {
  title?: string;
  description?: string;
  meta?: Array<{ name?: string; property?: string; content: string }>;
  data?: Record<string, any>;
};
```

### Handle

Tipe fungsi middleware untuk `hooks.server.ts`.

```ts
type Handle = (input: {
  event: RequestEvent;
  resolve: ResolveFunction;
}) => MaybePromise<Response>;
```

### Cookies

Antarmuka baca/tulis cookie yang tersedia di `event.cookies`.

```ts
interface Cookies {
  get(name: string): string | undefined;
  getAll(): Record<string, string>;
  set(name: string, value: string, options?: CookieOptions): void;
  delete(name: string, options?: Pick<CookieOptions, "path" | "domain">): void;
}
```

### CookieOptions

```ts
interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;       // seconds
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}
```

### HttpError

Kelas error yang dilempar oleh `error()`.

```ts
class HttpError extends Error {
  status: number;
}
```

### Redirect

Kelas redirect yang dilempar oleh `redirect()`.

```ts
class Redirect {
  status: number;
  location: string;
}
```

### ActionFailure\<T\>

Dikembalikan oleh `fail()` dalam form actions.

```ts
class ActionFailure<T extends Record<string, any>> {
  status: number;
  data: T;
}
```

### CsrfConfig

```ts
interface CsrfConfig {
  checkOrigin: boolean;
  allowedOrigins?: string[];
}
```

### CorsConfig

```ts
interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}
```

## Pola Import

| Import                                    | Sumber                   |
| ----------------------------------------- | ------------------------ |
| `import { cn, sequence } from "bosia"`  | Paket framework          |
| `import { cn } from "$lib/utils"`         | Utilitas proyek          |
| `import { VAR } from "$env"`             | Variabel lingkungan      |
| `import type { PageData } from "./$types"` | Tipe yang digenerate   |
