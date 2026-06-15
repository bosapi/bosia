---
title: Pages — Auth Register
description: Sign-up page composed from auth blocks — social grid, name/email/password, strength meter.
demo: AuthRegisterDemo
---

The account-creation screen: brand, social grid, name, work email and password fields with a live
[password strength](/blocks/auth) meter, a terms note, and a sign-in switch line. Defaults to the
centered layout; set `variant="split"` for the two-panel look.

## Preview

## Install

```bash
bun x bosia@latest add page auth/register
```

Installs `page.svelte` plus every auth block it composes. Pulls
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Register from "$lib/pages/auth/register/page.svelte";
</script>

<Register />
```

Switch layouts by editing the `variant` constant at the top of `page.svelte`. See the
[pages overview](/pages/overview).

## Backend

Visual only — no user creation or hashing. Pair with `bosia-auth-flow` for the server wiring.

## Source

`src/lib/pages/auth/register/page.svelte`
