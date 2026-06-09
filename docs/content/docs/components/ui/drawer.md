---
title: Drawer
description: A mobile-first bottom-sheet overlay with focus trap, scroll lock, and slide-up animation.
demo: DrawerDemo
---

```bash
bun x bosia@latest add drawer
```

A bottom-pinned sheet that slides up over the page. Built for mobile action sheets, pickers, and confirmation flows where a centered Dialog feels wrong on small screens. Traps focus, locks body scroll, and closes on Escape or backdrop click. Fully accessible with `role="dialog"`, `aria-modal`, `aria-labelledby`, and `aria-describedby`.

## Preview

## Props

### DrawerContent

| Prop                   | Type      | Default |
| ---------------------- | --------- | ------- |
| `closeOnBackdropClick` | `boolean` | `true`  |
| `showHandle`           | `boolean` | `true`  |
| `class`                | `string`  | `""`    |

### Drawer

| Prop   | Type      | Default |
| ------ | --------- | ------- |
| `open` | `boolean` | `false` |

## Sub-components

- `Drawer` — root context provider, manages open state
- `DrawerTrigger` — button that toggles the drawer open
- `DrawerContent` — fixed bottom-pinned panel with focus trap and slide-up animation
- `DrawerClose` — wraps any element to close on click
- `DrawerHeader` — flex container for title area
- `DrawerTitle` — `<h2>` linked via `aria-labelledby`
- `DrawerDescription` — muted text linked via `aria-describedby`
- `DrawerFooter` — footer with action buttons layout

## Usage

```svelte
<script lang="ts">
	import {
		Drawer,
		DrawerTrigger,
		DrawerContent,
		DrawerHeader,
		DrawerTitle,
		DrawerDescription,
		DrawerFooter,
		DrawerClose,
	} from "$lib/components/ui/drawer";
	import { Button } from "$lib/components/ui/button";
</script>

<Drawer>
	<DrawerTrigger>
		<Button variant="outline">Open Drawer</Button>
	</DrawerTrigger>
	<DrawerContent>
		<DrawerHeader>
			<DrawerTitle>Move Goal</DrawerTitle>
			<DrawerDescription>Set a daily activity target.</DrawerDescription>
		</DrawerHeader>
		<DrawerFooter>
			<Button>Save</Button>
			<DrawerClose>
				<Button variant="outline">Cancel</Button>
			</DrawerClose>
		</DrawerFooter>
	</DrawerContent>
</Drawer>
```

## Controlled Open State

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<Drawer bind:open>
	<DrawerTrigger>
		<Button>Open</Button>
	</DrawerTrigger>
	<DrawerContent>
		<DrawerHeader>
			<DrawerTitle>Controlled Drawer</DrawerTitle>
		</DrawerHeader>
		<p>You can control this drawer programmatically.</p>
	</DrawerContent>
</Drawer>

<p>Drawer is {open ? "open" : "closed"}</p>
```

## Hide the Drag Handle

```svelte
<DrawerContent showHandle={false}>
	<!-- No visual handle bar at the top -->
</DrawerContent>
```

## Disable Backdrop Close

```svelte
<DrawerContent closeOnBackdropClick={false}>
	<!-- Only closes via Escape key or DrawerClose button -->
</DrawerContent>
```

## When to Use

- **Drawer** — mobile action sheets, pickers, confirmation flows. Bottom-pinned, full width.
- **Dialog** — desktop modals, centered, constrained width. Use when the page is wide and the action isn't anchored to the bottom edge.

A common pattern is to switch between them at a breakpoint: Dialog on desktop, Drawer on mobile.

## Accessibility

- `role="dialog"` and `aria-modal="true"` on the content panel
- `aria-labelledby` linked to `DrawerTitle`
- `aria-describedby` linked to `DrawerDescription`
- Focus is trapped inside the drawer (Tab cycles through focusable elements)
- Focus returns to the trigger element when the drawer closes
- Escape key closes the drawer
- Body scroll is locked while open
- The drag handle is `aria-hidden` (decorative only — this drawer is tap-to-close)
