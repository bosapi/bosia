---
title: Pages — Auth OTP / 2FA
description: Two-factor screen — segmented 6-digit code input and verify.
demo: AuthOtpDemo
---

The two-factor screen: a shield badge, a segmented 6-digit [OTP input](/blocks/auth) with
auto-advance and paste, an info message, a verify button and a resend link. Defaults to the
centered layout; set `variant="split"` for the two-panel look.

## Preview

## Install

```bash
bun x bosia@latest add page auth/otp
```

Installs `page.svelte` plus every auth block it composes. Pulls
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Otp from "$lib/pages/auth/otp/page.svelte";
</script>

<Otp />
<Otp variant="split" />
```

Both layouts are shown in the preview above; pass `variant="split"` (or change its default in
`page.svelte`) to use the two-panel split.

The page uses the `auth/otp-input` block; [`ui/input-otp`](/components/ui/input-otp) is a primitive
alternative.

## Backend

Visual only — no code generation or verification. Pair with `bosia-auth-flow` for the server wiring.

## Source

`src/lib/pages/auth/otp/page.svelte`
