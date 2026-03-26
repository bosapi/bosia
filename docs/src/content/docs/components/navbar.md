---
title: Navbar
description: A responsive navbar with desktop links, mobile dropdown menu, theme toggle, and user avatar.
---

```bash
bosia add navbar
```

A responsive navigation bar with desktop link row, mobile hamburger menu, dark mode toggle, and optional user avatar dropdown. Automatically installs dependencies: `button`, `avatar`, `dropdown-menu`, `icon`.

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

| Prop          | Type                                                  | Default     |
| ------------- | ----------------------------------------------------- | ----------- |
| `brand`       | `string`                                              | `"Bosia"`   |
| `version`     | `string`                                              | `""`        |
| `links`       | `{ label: string; href: string }[]`                   | `[]`        |
| `currentPath` | `string`                                              | `"/"`       |
| `user`        | `{ name: string; email: string; initials: string }`   | `undefined` |

## With User Avatar

When `user` is provided, a dropdown menu appears with Profile, Settings, and Log out items:

```svelte
<Navbar
  {links}
  currentPath="/"
  user={{ name: "Alice", email: "alice@bosia.dev", initials: "A" }}
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
  <Button variant="ghost" size="icon" aria-label="Notifications">
    🔔
  </Button>
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
