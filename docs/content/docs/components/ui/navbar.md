---
title: Navbar
description: A responsive navbar with desktop links, mobile dropdown menu, theme toggle, and user avatar.
demo: NavbarDemo
---

```bash
bun x bosia@latest add navbar
```

A responsive navigation bar with desktop link row, mobile hamburger menu, a theme toggle that cycles Light / Dark / System (persists your choice and follows the OS while in System mode), and optional user avatar dropdown. Automatically installs dependencies: `button`, `avatar`, `dropdown-menu`, and the npm package [`@lucide/svelte`](/components/ui/icon/).

## Preview

## Basic Usage

```svelte
<script lang="ts">
	import { Navbar } from "$lib/components/ui/navbar";

	const links = [
		{ label: "Home", href: "/" },
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Settings", href: "/settings" },
	];
</script>

<Navbar {links} currentPath="/" />
```

## Props

| Prop          | Type                                                                 | Default     |
| ------------- | -------------------------------------------------------------------- | ----------- |
| `brand`       | `string`                                                             | `"Bosia"`   |
| `version`     | `string`                                                             | `""`        |
| `links`       | `{ label: string; href: string }[]`                                  | `[]`        |
| `currentPath` | `string`                                                             | `"/"`       |
| `user`        | `{ name: string; email: string; initials: string; avatar?: string }` | `undefined` |

## With User Avatar

When `user` is provided, a dropdown menu appears with Profile, Settings, and Log out items:

```svelte
<Navbar
	{links}
	currentPath="/"
	user={{ name: "Jeki", email: "jeki@bosia.dev", initials: "J", avatar: "/favicon.svg" }}
/>
```

## Custom Branding

```svelte
<Navbar brand="My App" version="v1.0" {links} currentPath="/" />
```

## Extra Actions Slot

Use the children slot to add custom actions (e.g., a notification bell) to the right side of the navbar:

```svelte
<Navbar {links} currentPath="/">
	<Button variant="ghost" size="icon" aria-label="Notifications">🔔</Button>
</Navbar>
```

## Sub-components

- `Navbar` — main responsive navbar
- `NavbarLink` — individual nav link with active state styling
- `NavbarMobileMenu` — hamburger dropdown for mobile viewports (hidden on `md:` and above)

### Using NavbarLink Directly

```svelte
<script lang="ts">
	import { NavbarLink } from "$lib/components/ui/navbar";
</script>

<NavbarLink href="/about" label="About" active={false} />
```
