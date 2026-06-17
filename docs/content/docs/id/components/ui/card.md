---
title: Card
description: Komponen card dengan slot header, konten, dan footer.
demo: CardDemo
---

```bash
bun x bosia@latest add card
```

Card dengan sub-komponen komposabel: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, dan `CardFooter`.

## Preview

## Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Semua sub-komponen (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) menerima `class` dan bersifat opsional.

## Penggunaan

```svelte
<script lang="ts">
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter,
	} from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
</script>

<Card>
	<CardHeader>
		<CardTitle>Welcome</CardTitle>
		<CardDescription>Get started with Bosia</CardDescription>
	</CardHeader>
	<CardContent>
		<p>Your content here.</p>
	</CardContent>
	<CardFooter>
		<Button>Continue</Button>
	</CardFooter>
</Card>
```

## Card Minimal

Semua sub-komponen bersifat opsional:

```svelte
<Card class="p-6">
	<p>Simple content card.</p>
</Card>
```
