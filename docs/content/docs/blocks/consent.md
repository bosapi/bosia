---
title: Consent Banner
description: A cookie-consent bar fixed to the bottom edge — the accept/decline choice persists in localStorage.
demo: ConsentBannerDemo
---

A cookie-consent bar that sits fixed at the bottom of the viewport until the visitor accepts or
declines. The choice is stored in `localStorage`, so the banner never shows again on later visits.
Built only from semantic tokens — try the theme switcher above the preview.

## Preview

The preview confines the banner to the demo box; in your app it spans the bottom of the viewport.

## Install

```bash
bun x bosia@latest add block consent/banner
```

## Usage

Render it once in your root layout:

```svelte
<script lang="ts">
	import ConsentBanner from "$lib/blocks/consent/banner/block.svelte";

	let { children } = $props();
</script>

{@render children()}
<ConsentBanner
	onDecision={(accepted) => {
		if (accepted) {
			// load analytics here
		}
	}}
/>
```

Props: `message`, `policyHref`/`policyLabel`, `acceptLabel`/`declineLabel`, `storageKey` (default
`cookie-consent` — change it to re-ask everyone after a policy update) and `onDecision(accepted)`
for gating analytics. Declining hides the banner too; nothing breaks without consent.

## Source

`src/lib/blocks/consent/banner/block.svelte`
