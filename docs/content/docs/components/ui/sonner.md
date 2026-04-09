---
title: Sonner
description: An opinionated toast notification component with zero dependencies.
demo: SonnerDemo
---

```bash
bosia add sonner
```

A zero-dependency toast notification component. Provides success, error, info, warning, and default toast variants with shadcn-compatible styling.

## Preview

## Setup

Add the `<Toaster />` component to your root layout so toasts can render from anywhere in your app:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { Toaster } from "$lib/components/ui/sonner";
</script>

<Toaster />

{@render children()}
```

## Props

### Toaster

| Prop         | Type                                                                 | Default          |
| ------------ | -------------------------------------------------------------------- | ---------------- |
| `position`   | `"top-left"` \| `"top-right"` \| `"bottom-left"` \| `"bottom-right"` \| `"top-center"` \| `"bottom-center"` | `"bottom-right"` |
| `class`      | `string`                                                             | `""`             |

## Usage

```svelte
<script lang="ts">
  import { toast } from "$lib/components/ui/sonner";
</script>

<button onclick={() => toast("Hello world!")}>
  Show Toast
</button>
```

## Variants

```svelte
<script lang="ts">
  import { toast } from "$lib/components/ui/sonner";
</script>

<button onclick={() => toast("Default toast")}>Default</button>
<button onclick={() => toast.success("Success!")}>Success</button>
<button onclick={() => toast.error("Something went wrong")}>Error</button>
<button onclick={() => toast.info("FYI")}>Info</button>
<button onclick={() => toast.warning("Be careful")}>Warning</button>
```

## With Description

```svelte
<button onclick={() => toast("Event created", {
  description: "Monday, January 3rd at 6:00pm",
})}>
  Show Toast
</button>
```

## Programmatic Dismiss

```svelte
<script lang="ts">
  import { toast } from "$lib/components/ui/sonner";

  const id = toast("Processing...");
  // Later:
  toast.dismiss(id);
</script>
```
