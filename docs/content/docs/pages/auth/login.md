---
title: Pages — Auth Login
description: Sign-in page composed from auth blocks — social row, email + password, remember me.
demo: AuthLoginDemo
---

The sign-in screen: brand, social row, divider, email and password fields, remember me, and a
create-account switch line. Defaults to the centered layout; set `variant="split"` for the
two-panel look.

## Preview

## Install

```bash
bun x bosia@latest add page auth/login
```

Installs `page.svelte` plus every auth block it composes. Pulls
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Login from "$lib/pages/auth/login/page.svelte";
</script>

<Login />
<Login variant="split" />
```

Pass the `variant` prop (or change its default at the top of `page.svelte`) to switch between the
centered card and the two-panel split — both are shown in the preview above. See the
[pages overview](/pages/overview) for the auth family.

## Backend

Visual only — no sessions or password hashing. Pair with `bosia-auth-flow` for the server wiring.

## Source

`src/lib/pages/auth/login/page.svelte`
