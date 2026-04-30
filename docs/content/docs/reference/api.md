---
title: API Reference
description: All exported functions and types from the bosia package.
---

Everything is imported from `"bosia"`:

```ts
import { cn, sequence, error, redirect, fail } from "bosia";
import type { RequestEvent, LoadEvent, Handle, Cookies } from "bosia";
```

## Functions

### cn(...inputs)

Merge Tailwind CSS classes safely. Uses built-in class merging and [tailwind-merge](https://github.com/dcastil/tailwind-merge).

```ts
cn("px-4 py-2", "px-6"); // → "py-2 px-6"
cn("text-red-500", isActive && "text-blue-500");
```

### sequence(...handlers)

Compose multiple `Handle` middleware into a single handler:

```ts
export const handle = sequence(auth, logging, rateLimit);
```

Handlers execute left-to-right. Each handler's `resolve` calls the next.

### error(status, message)

Throw an HTTP error from a `load()` function. Renders the nearest `+error.svelte`.

```ts
error(404, "Post not found"); // never returns
```

### redirect(status, location, options?)

Redirect from a `load()` function or form action.

```ts
redirect(303, "/login"); // never returns
```

**Open redirect protection:** By default, `redirect()` only allows relative paths and same-origin URLs. External URLs, protocol-relative URLs (`//evil.com`), and dangerous schemes (`javascript:`, `data:`) are rejected with a descriptive error.

To redirect to an external URL (e.g., an OAuth provider), pass `{ allowExternal: true }`:

```ts
redirect(303, "https://oauth.provider.com/authorize?...", {
	allowExternal: true,
});
```

### fail(status, data)

Return a validation failure from a form action. **Returned**, not thrown.

```ts
return fail(400, { email, errors: { email: "Required" } });
```

## Types

### RequestEvent

Available in API routes (`+server.ts`) and form actions.

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

Available in `load()` functions in `+page.server.ts` and `+layout.server.ts`.

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

Available in `metadata()` functions in `+page.server.ts`.

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

Return type for `metadata()` functions.

```ts
type Metadata = {
	title?: string;
	description?: string;
	meta?: Array<{ name?: string; property?: string; content: string }>;
	data?: Record<string, any>;
};
```

### Handle

Middleware function type for `hooks.server.ts`.

```ts
type Handle = (input: { event: RequestEvent; resolve: ResolveFunction }) => MaybePromise<Response>;
```

### Cookies

Cookie read/write interface available on `event.cookies`.

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
	maxAge?: number; // seconds
	expires?: Date;
	httpOnly?: boolean;
	secure?: boolean;
	sameSite?: "Strict" | "Lax" | "None";
}
```

### HttpError

Error class thrown by `error()`.

```ts
class HttpError extends Error {
	status: number;
}
```

### Redirect

Redirect class thrown by `redirect()`. Validates the location at construction time to prevent open redirects.

```ts
class Redirect {
	status: number;
	location: string;
}
```

### RedirectOptions

```ts
interface RedirectOptions {
	/** Allow redirects to external origins. */
	allowExternal?: boolean;
}
```

### ActionFailure\<T\>

Returned by `fail()` in form actions.

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

## Import Patterns

| Import                                     | Source            |
| ------------------------------------------ | ----------------- |
| `import { cn, sequence } from "bosia"`     | Framework package |
| `import { cn } from "$lib/utils"`          | Project utility   |
| `import { VAR } from "$env"`               | Environment vars  |
| `import type { PageData } from "./$types"` | Generated types   |
