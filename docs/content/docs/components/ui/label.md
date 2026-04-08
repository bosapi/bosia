---
title: Label
description: An accessible label component for form controls.
demo: LabelDemo
---

```bash
bosia add label
```

An accessible label that pairs with form controls. Automatically dims when the associated control is disabled via the `peer-disabled` modifier.

## Preview

## Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `for`   | `string` | —       |
| `class` | `string` | `""`    |

## Usage

```svelte
<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
</script>

<div class="grid w-full max-w-sm gap-1.5">
  <Label for="email">Email</Label>
  <Input type="email" id="email" placeholder="you@example.com" />
</div>
```

## Disabled State

When paired with a disabled input using Tailwind's `peer` modifier, the label automatically reduces opacity:

```svelte
<div class="grid w-full max-w-sm gap-1.5">
  <Input type="email" id="email-disabled" disabled class="peer" />
  <Label for="email-disabled">Email (disabled)</Label>
</div>
```
