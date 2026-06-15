---
title: Auth Blocks
description: Shared auth UI — brand, shell, card, social row, divider, field, password strength, OTP and form messages.
demo: AuthBlocksDemo
---

The reusable building blocks behind the [auth pages](/pages/overview). Each is a self-contained,
prop-driven piece using semantic tokens only, so they restyle across every theme. Compose them
yourself, or install a whole [auth page](/pages/overview) that wires them together.

## Preview

## Install

```bash
bun x bosia@latest add block auth/auth-shell
bun x bosia@latest add block auth/auth-card
bun x bosia@latest add block auth/brand
bun x bosia@latest add block auth/social-row
bun x bosia@latest add block auth/divider
bun x bosia@latest add block auth/auth-field
bun x bosia@latest add block auth/password-strength
bun x bosia@latest add block auth/otp-input
bun x bosia@latest add block auth/form-message
```

Several pull [`@lucide/svelte`](/components/ui/icon/) for icons.

## The blocks

- **`auth-shell`** — layout frame; `variant="centered"` (card on the page) or `variant="split"`
  (brand/photo panel beside the form column).
- **`auth-card`** — card container with brand, optional badge icon, eyebrow, display heading, lede,
  content and a centered switch-line footer.
- **`brand`** — inline logomark + wordmark; `tone="inherit"` adapts it to a coloured panel.
- **`social-row`** — Google / Apple / GitHub / Microsoft buttons with inlined brand logos; stacked
  or a compact 3-up `grid`.
- **`divider`** — hairline rule with a centered label (defaults to "or").
- **`auth-field`** — labeled input with a leading lucide `icon`, password show/hide toggle and
  helper/error text.
- **`password-strength`** — three-segment strength meter with a label.
- **`otp-input`** — segmented 6-digit code input with auto-advance, backspace and paste.
- **`form-message`** — success / error / info alert row with a matching icon.

## Usage

```svelte
<script lang="ts">
	import { Mail, Lock } from "@lucide/svelte";
	import AuthShell from "$lib/blocks/auth/auth-shell/block.svelte";
	import AuthCard from "$lib/blocks/auth/auth-card/block.svelte";
	import AuthField from "$lib/blocks/auth/auth-field/block.svelte";
</script>

<AuthShell variant="centered">
	<AuthCard title="Welcome back" lede="Sign in to pick up where you left off.">
		<AuthField name="email" label="Email" type="email" icon={Mail} placeholder="you@company.com" />
		<AuthField name="password" type="password" icon={Lock} placeholder="••••••••" />
	</AuthCard>
</AuthShell>
```

The brand action is always `primary` (never `accent`); the password meter uses status colours
(destructive / amber / emerald), not the brand.

## Backend

These are the visual layer only — no sessions, hashing or server actions. Pair with the
[`bosia-auth-flow`](/guides/security) wiring for real authentication.

## Source

`src/lib/blocks/auth/*/block.svelte`
