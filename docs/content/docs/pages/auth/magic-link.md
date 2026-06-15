---
title: Pages — Auth Magic Link
description: Confirmation screen after a passwordless or reset email — check your inbox.
demo: AuthMagicLinkDemo
---

The "we sent you a link" screen: a mail badge, the destination email, a success message, a resend
link and a back-to-sign-in button. Covers both magic-link and reset-sent flows. Defaults to the
centered layout; set `variant="split"` for the two-panel look.

## Preview

## Install

```bash
bun x bosia@latest add page auth/magic-link
```

Installs `page.svelte` plus every auth block it composes. Pulls
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import MagicLink from "$lib/pages/auth/magic-link/page.svelte";
</script>

<MagicLink />
```

## Backend

Visual only — no link generation or delivery. Pair with `bosia-auth-flow` for the server wiring.

## Source

`src/lib/pages/auth/magic-link/page.svelte`
