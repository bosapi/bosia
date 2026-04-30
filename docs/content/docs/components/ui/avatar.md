---
title: Avatar
description: An avatar component with image and fallback slots.
demo: AvatarDemo
---

```bash
bosia add avatar
```

An avatar with image and fallback support. Shows fallback content when the image fails to load.

## Preview

## Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `src`   | `string` | —       |
| `alt`   | `string` | `""`    |
| `class` | `string` | `""`    |

## Usage

```svelte
<script lang="ts">
	import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
</script>

<!-- With image -->
<Avatar src="/favicon.svg" alt="John Doe">
	<AvatarFallback>JD</AvatarFallback>
</Avatar>

<!-- Fallback only -->
<Avatar>
	<AvatarFallback>AB</AvatarFallback>
</Avatar>
```

## Custom Size

```svelte
<Avatar src="/favicon.svg" alt="User" class="h-16 w-16">
	<AvatarFallback>U</AvatarFallback>
</Avatar>
```
