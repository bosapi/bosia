---
title: Contact Sections
description: Contact sections — a split form-beside-details layout and a centered form.
demo: ContactSectionsDemo
---

Contact sections for a company or product site. Each is a self-contained, full-width Svelte
`<section>` built **only** from semantic tokens, so it restyles across every theme. Try the theme
switcher above the preview.

## Preview

## Install

```bash
bun x bosia@latest add block contact/split
bun x bosia@latest add block contact/simple
```

`split` pulls [`@lucide/svelte`](/components/ui/icon/) for its detail icons.

## The blocks

- **`split`** — heading, blurb and contact details (email, phone, office) beside a card form.
- **`simple`** — a centered heading over a compact name / email / message form.

## Usage

```svelte
<script lang="ts">
	import Contact from "$lib/blocks/contact/split/block.svelte";
</script>

<Contact />
```

Both forms `POST` JSON (`name`, `email`, `message`) to `/api/contact` — pass a different endpoint
via the `action` prop. Install the [`contact-form` feature](/guides/contact-form/) to get that
endpoint with validation and Drizzle-backed storage; without it, wire `action` to your own route.
Edit the copy and contact details in each `block.svelte`.

## Source

`src/lib/blocks/contact/*/block.svelte`
