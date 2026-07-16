---
title: Pages — Contact
description: A contact page composed from blocks — minimal navbar, split contact form with details, minimal footer.
demo: PagesCompanyContactDemo
---

A complete contact page: a minimal navbar, the split contact section (form beside email / phone /
office details) and a minimal footer. Every block is theme-aware — try the theme switcher above
the preview.

## Preview

## Install

```bash
bun x bosia@latest add page company/contact
```

Installs `page.svelte` plus every block it composes. The contact block pulls
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Contact from "$lib/pages/company/contact/page.svelte";
</script>

<Contact />
```

The page is composition only — it imports each block and stacks them in order, with no props.
The form posts to `/api/contact`; install the [`contact-form` feature](/guides/contact-form/) for
the backend, or point the block's `action` prop at your own endpoint. Swap `contact/split` for
`contact/simple` in `page.svelte` for a centered layout.

## Source

`src/lib/pages/company/contact/page.svelte`
