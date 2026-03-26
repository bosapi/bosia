---
title: Button
description: An accessible button component with multiple variants and sizes.
---

```bash
bosia add button
```

An accessible button with multiple variants and sizes. Renders as `<a>` when `href` is provided.

## Props

| Prop      | Type                                                             | Default     |
| --------- | ---------------------------------------------------------------- | ----------- |
| `variant` | `"default"` \| `"destructive"` \| `"outline"` \| `"secondary"` \| `"ghost"` \| `"link"` | `"default"` |
| `size`    | `"default"` \| `"sm"` \| `"lg"` \| `"icon"`                     | `"default"` |
| `href`    | `string`                                                         | —           |
| `disabled`| `boolean`                                                        | `false`     |
| `type`    | `"button"` \| `"submit"` \| `"reset"`                           | `"button"`  |

## Usage

```svelte
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
</script>

<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="lg">Large Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link Style</Button>
<Button href="/about">As Link</Button>
<Button size="icon">★</Button>
```

## Form Submit

```svelte
<form method="POST">
  <Button type="submit">Save Changes</Button>
</form>
```
