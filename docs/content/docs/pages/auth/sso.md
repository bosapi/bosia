---
title: Pages — Auth SSO
description: Enterprise single sign-on screen — work email or domain.
demo: AuthSsoDemo
---

The enterprise screen: a building badge, an "Enterprise" eyebrow, a work email / domain field, a
continue-with-SSO button and a use-another-method switch line. Defaults to the centered layout; set
`variant="split"` for the two-panel look.

## Preview

## Install

```bash
bun x bosia@latest add page auth/sso
```

Installs `page.svelte` plus every auth block it composes. Pulls
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Sso from "$lib/pages/auth/sso/page.svelte";
</script>

<Sso />
<Sso variant="split" />
```

Both layouts are shown in the preview above; pass `variant="split"` (or change its default in
`page.svelte`) to use the two-panel split.

## Backend

Visual only — no identity-provider redirect. Pair with `bosia-auth-flow` for the server wiring.

## Source

`src/lib/pages/auth/sso/page.svelte`
