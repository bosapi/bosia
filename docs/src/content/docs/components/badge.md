---
title: Badge
description: A small status badge with multiple variants.
---

```bash
bosia add badge
```

A small status label with variant styling.

## Props

| Prop      | Type                                                             | Default     |
| --------- | ---------------------------------------------------------------- | ----------- |
| `variant` | `"default"` \| `"secondary"` \| `"destructive"` \| `"outline"` | `"default"` |

## Usage

```svelte
<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
</script>

<Badge>Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
```
