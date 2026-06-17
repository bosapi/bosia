---
title: Button
description: Komponen button yang aksesibel dengan beragam varian dan ukuran.
demo: ButtonDemo
---

```bash
bun x bosia@latest add button
```

Button aksesibel dengan beragam varian dan ukuran. Dirender sebagai `<a>` saat `href` diberikan.

## Preview

## Props

| Prop       | Type                                                                                    | Default     |
| ---------- | --------------------------------------------------------------------------------------- | ----------- |
| `variant`  | `"default"` \| `"destructive"` \| `"outline"` \| `"secondary"` \| `"ghost"` \| `"link"` | `"default"` |
| `size`     | `"default"` \| `"sm"` \| `"lg"` \| `"icon"`                                             | `"default"` |
| `href`     | `string`                                                                                | —           |
| `disabled` | `boolean`                                                                               | `false`     |
| `type`     | `"button"` \| `"submit"` \| `"reset"`                                                   | `"button"`  |

## Penggunaan

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

## Submit Form

```svelte
<form method="POST">
	<Button type="submit">Save Changes</Button>
</form>
```
