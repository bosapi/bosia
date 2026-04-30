---
title: Dialog
description: A modal dialog overlay with focus trap, scroll lock, and accessible markup.
demo: DialogDemo
---

```bash
bosia add dialog
```

A modal dialog that overlays the page with a backdrop, traps focus, locks body scroll, and closes on Escape or backdrop click. Fully accessible with `role="dialog"`, `aria-modal`, `aria-labelledby`, and `aria-describedby`.

## Preview

## Props

### DialogContent

| Prop                   | Type      | Default |
| ---------------------- | --------- | ------- |
| `closeOnBackdropClick` | `boolean` | `true`  |
| `class`                | `string`  | `""`    |

### Dialog

| Prop   | Type      | Default |
| ------ | --------- | ------- |
| `open` | `boolean` | `false` |

## Sub-components

- `Dialog` — root context provider, manages open state
- `DialogTrigger` — button that toggles the dialog open
- `DialogContent` — fixed overlay + panel with focus trap and animations
- `DialogClose` — wraps any element to close on click
- `DialogHeader` — flex container for title area
- `DialogTitle` — `<h2>` linked via `aria-labelledby`
- `DialogDescription` — muted text linked via `aria-describedby`
- `DialogFooter` — footer with action buttons layout

## Usage

```svelte
<script lang="ts">
	import {
		Dialog,
		DialogTrigger,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose,
	} from "$lib/components/ui/dialog";
	import { Button } from "$lib/components/ui/button";
</script>

<Dialog>
	<DialogTrigger>
		<Button variant="outline">Open Dialog</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Are you sure?</DialogTitle>
			<DialogDescription>This action cannot be undone.</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<DialogClose>
				<Button variant="outline">Cancel</Button>
			</DialogClose>
			<Button>Confirm</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
```

## Controlled Open State

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<Dialog bind:open>
	<DialogTrigger>
		<Button>Open</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Controlled Dialog</DialogTitle>
		</DialogHeader>
		<p>You can control this dialog programmatically.</p>
	</DialogContent>
</Dialog>

<p>Dialog is {open ? "open" : "closed"}</p>
```

## Disable Backdrop Close

```svelte
<DialogContent closeOnBackdropClick={false}>
	<!-- Only closes via Escape key or DialogClose button -->
</DialogContent>
```

## Accessibility

- `role="dialog"` and `aria-modal="true"` on the content panel
- `aria-labelledby` linked to `DialogTitle`
- `aria-describedby` linked to `DialogDescription`
- Focus is trapped inside the dialog (Tab cycles through focusable elements)
- Focus returns to the trigger element when the dialog closes
- Escape key closes the dialog
- Body scroll is locked while open
