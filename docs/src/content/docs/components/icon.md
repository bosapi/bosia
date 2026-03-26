---
title: Icon
description: An SVG icon component powered by inline Lucide-style icons.
---

```bash
bosia add icon
```

Inline SVG icons (Lucide-style). No external dependency required.

## Props

| Prop   | Type                                       | Default |
| ------ | ------------------------------------------ | ------- |
| `name` | `"sun"` \| `"moon"` \| `"menu"` \| `"x"` | —       |
| `size` | `number`                                   | `18`    |

## Usage

```svelte
<script lang="ts">
  import { Icon } from "$lib/components/ui/icon";
</script>

<Icon name="sun" />
<Icon name="moon" />
<Icon name="menu" size={24} />
<Icon name="x" size={16} />
```

## With Button

```svelte
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Icon } from "$lib/components/ui/icon";
</script>

<Button variant="ghost" size="icon">
  <Icon name="menu" />
</Button>
```
