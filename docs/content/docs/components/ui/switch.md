---
title: Switch
description: A toggle switch control for on/off states.
demo: SwitchDemo
---

```bash
bosia add switch
```

A toggle switch built on a native `<button>` with `role="switch"`, featuring a pill-shaped track with a sliding thumb.

## Preview

## Props

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `checked`  | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `id`       | `string`  | —       |
| `name`     | `string`  | —       |
| `value`    | `string`  | —       |
| `class`    | `string`  | `""`    |

## Usage

```svelte
<script lang="ts">
	import { Switch } from "$lib/components/ui/switch";
	let enabled = $state(false);
</script>

<Switch bind:checked={enabled} />
```

## With Label

```svelte
<script lang="ts">
	import { Switch } from "$lib/components/ui/switch";
	import { Label } from "$lib/components/ui/label";
</script>

<div class="flex items-center gap-2">
	<Switch id="airplane" />
	<Label for="airplane">Airplane Mode</Label>
</div>
```

## Disabled

```svelte
<Switch disabled checked />
```

## Form Usage

When a `name` prop is provided, a hidden `<input type="checkbox">` is rendered for native form submission.

```svelte
<form method="POST">
	<Switch name="notifications" value="yes" />
	<button type="submit">Save</button>
</form>
```
