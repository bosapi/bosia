---
title: Card
description: A card component with header, content, and footer slots.
---

```bash
bosia add card
```

A card with composable sub-components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`.

## Usage

```svelte
<script lang="ts">
  import {
    Card, CardHeader, CardTitle,
    CardDescription, CardContent, CardFooter
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
</script>

<Card>
  <CardHeader>
    <CardTitle>Welcome</CardTitle>
    <CardDescription>Get started with Bosia</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your content here.</p>
  </CardContent>
  <CardFooter>
    <Button>Continue</Button>
  </CardFooter>
</Card>
```

## Minimal Card

All sub-components are optional:

```svelte
<Card class="p-6">
  <p>Simple content card.</p>
</Card>
```
