---
title: Checkbox
description: A checkbox control for toggling options on and off.
demo: CheckboxDemo
---

```bash
bosia add checkbox
```

A checkbox built on a native `<button>` with `role="checkbox"`, supporting checked, unchecked, and indeterminate states.

## Preview

## Props

| Prop            | Type      | Default     |
| --------------- | --------- | ----------- |
| `checked`       | `boolean` | `false`     |
| `indeterminate` | `boolean` | `false`     |
| `disabled`      | `boolean` | `false`     |
| `id`            | `string`  | —           |
| `name`          | `string`  | —           |
| `value`         | `string`  | —           |
| `class`         | `string`  | `""`        |

## Usage

```svelte
<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox";
  let accepted = $state(false);
</script>

<Checkbox bind:checked={accepted} />
```

## With Label

```svelte
<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Label } from "$lib/components/ui/label";
</script>

<div class="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label for="terms">Accept terms and conditions</Label>
</div>
```

## Disabled

```svelte
<Checkbox disabled checked />
```

## Indeterminate

Use the `indeterminate` prop to show a mixed state (e.g. when a parent checkbox represents partially selected children).

```svelte
<Checkbox indeterminate />
```

## Form Usage

When a `name` prop is provided, a hidden `<input type="checkbox">` is rendered for native form submission.

```svelte
<form method="POST">
  <Checkbox name="newsletter" value="yes" />
  <button type="submit">Subscribe</button>
</form>
```
