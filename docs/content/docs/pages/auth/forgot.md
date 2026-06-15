---
title: Pages — Auth Forgot Password
description: Password-recovery page — email field, reset-link note, back to sign in.
demo: AuthForgotDemo
---

The recovery screen: an "Account recovery" eyebrow, email field, an info message about the
single-use reset link, and a back-to-sign-in switch line. Defaults to the centered layout; set
`variant="split"` for the two-panel look.

## Preview

## Install

```bash
bun x bosia@latest add page auth/forgot
```

Installs `page.svelte` plus every auth block it composes. Pulls
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Forgot from "$lib/pages/auth/forgot/page.svelte";
</script>

<Forgot />
```

## Backend

Visual only — no token minting or email. Pair with `bosia-auth-flow` for the server wiring.

## Source

`src/lib/pages/auth/forgot/page.svelte`
