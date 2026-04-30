---
title: Tabs
description: A set of layered sections of content displayed one at a time.
demo: TabsDemo
---

```bash
bosia add tabs
```

A compound component for switching between mutually exclusive sections of content. Built on `role="tablist"` / `role="tab"` / `role="tabpanel"` with roving tabindex, arrow key navigation, and `Home`/`End` support.

## Preview

## Tabs Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `value` | `string` | `""`    |
| `class` | `string` | `""`    |

## TabsList Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## TabsTrigger Props

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `value`    | `string`  | —       |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

## TabsContent Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `value` | `string` | —       |
| `class` | `string` | `""`    |

## Usage

```svelte
<script lang="ts">
	import { Tabs, TabsList, TabsTrigger, TabsContent } from "$lib/components/ui/tabs";
	let value = $state("account");
</script>

<Tabs bind:value>
	<TabsList>
		<TabsTrigger value="account">Account</TabsTrigger>
		<TabsTrigger value="password">Password</TabsTrigger>
	</TabsList>
	<TabsContent value="account">Account settings go here.</TabsContent>
	<TabsContent value="password">Password settings go here.</TabsContent>
</Tabs>
```

## Keyboard Navigation

| Key                        | Action                              |
| -------------------------- | ----------------------------------- |
| `ArrowRight` / `ArrowDown` | Focus and activate the next tab     |
| `ArrowLeft` / `ArrowUp`    | Focus and activate the previous tab |
| `Home`                     | Focus and activate the first tab    |
| `End`                      | Focus and activate the last tab     |

## Disabled Trigger

```svelte
<Tabs value="a">
	<TabsList>
		<TabsTrigger value="a">Active</TabsTrigger>
		<TabsTrigger value="b" disabled>Disabled</TabsTrigger>
	</TabsList>
	<TabsContent value="a">Panel A</TabsContent>
	<TabsContent value="b">Panel B</TabsContent>
</Tabs>
```
