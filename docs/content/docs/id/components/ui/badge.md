---
title: Badge
description: Badge status kecil dengan beberapa varian.
demo: BadgeDemo
---

```bash
bun x bosia@latest add badge
```

Label status kecil dengan styling varian.

## Preview

## Props

| Prop      | Type                                                           | Default     |
| --------- | -------------------------------------------------------------- | ----------- |
| `variant` | `"default"` \| `"secondary"` \| `"destructive"` \| `"outline"` | `"default"` |

## Penggunaan

```svelte
<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
</script>

<Badge>Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
```
