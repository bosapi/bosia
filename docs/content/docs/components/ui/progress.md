---
title: Progress
description: Displays an indicator showing the completion progress of a task.
demo: ProgressDemo
---

```bash
bosia add progress
```

A linear progress indicator that visualizes task completion. Renders a `<div role="progressbar">` track with an inner indicator whose `translateX` transform is driven by the `value` / `max` ratio. Fully accessible via `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.

## Preview

## Props

| Prop    | Type             | Default |
| ------- | ---------------- | ------- |
| `value` | `number \| null` | `null`  |
| `max`   | `number`         | `100`   |
| `class` | `string`         | `""`    |

Passing `null` (or omitting `value`) leaves `aria-valuenow` unset, signaling an indeterminate state. All additional attributes are forwarded to the root `<div>`.

## Usage

```svelte
<script lang="ts">
	import { Progress } from "$lib/components/ui/progress";
</script>

<Progress value={33} />
```

## Examples

Animate progress as work completes by updating a reactive `$state` value.

```svelte
<script lang="ts">
	import { Progress } from "$lib/components/ui/progress";

	let value = $state(13);

	$effect(() => {
		const timer = setTimeout(() => (value = 66), 500);
		return () => clearTimeout(timer);
	});
</script>

<Progress {value} class="w-[60%]" />
```

Use a custom `max` for non-percentage scales.

```svelte
<Progress value={3} max={5} />
```
