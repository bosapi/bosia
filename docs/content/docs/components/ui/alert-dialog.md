---
title: Alert Dialog
description: A modal alert dialog that interrupts the user with important content and requires an explicit response.
demo: AlertDialogDemo
---

```bash
bosia add alert-dialog
```

A modal dialog that interrupts the user with important content and expects a response. Unlike a regular Dialog, the Alert Dialog uses `role="alertdialog"` and does **not** close when clicking the backdrop — the user must explicitly choose an action.

## Preview

## Props

### AlertDialog

| Prop   | Type      | Default |
| ------ | --------- | ------- |
| `open` | `boolean` | `false` |

### AlertDialogContent

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

### AlertDialogAction

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

### AlertDialogCancel

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## Sub-components

- `AlertDialog` — root context provider, manages open state
- `AlertDialogTrigger` — button that toggles the dialog open
- `AlertDialogContent` — fixed overlay + panel with focus trap, animations, no backdrop close
- `AlertDialogAction` — button that closes the dialog (primary/default styling)
- `AlertDialogCancel` — button that closes the dialog (outline styling)
- `AlertDialogHeader` — flex container for title area
- `AlertDialogTitle` — `<h2>` linked via `aria-labelledby`
- `AlertDialogDescription` — muted text linked via `aria-describedby`
- `AlertDialogFooter` — footer with action buttons layout

## Usage

```svelte
<script lang="ts">
	import {
		AlertDialog,
		AlertDialogTrigger,
		AlertDialogContent,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogAction,
		AlertDialogCancel,
	} from "$lib/components/ui/alert-dialog";
	import { Button } from "$lib/components/ui/button";
</script>

<AlertDialog>
	<AlertDialogTrigger>
		<Button variant="outline">Delete Account</Button>
	</AlertDialogTrigger>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
			<AlertDialogDescription>
				This action cannot be undone. This will permanently delete your account and remove
				your data from our servers.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction>Continue</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
```

## Controlled Open State

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<AlertDialog bind:open>
	<AlertDialogTrigger>
		<Button>Show Alert</Button>
	</AlertDialogTrigger>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Confirm Action</AlertDialogTitle>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction>OK</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

<p>Dialog is {open ? "open" : "closed"}</p>
```

## Accessibility

- `role="alertdialog"` and `aria-modal="true"` on the content panel
- `aria-labelledby` linked to `AlertDialogTitle`
- `aria-describedby` linked to `AlertDialogDescription`
- Focus is trapped inside the dialog (Tab cycles through focusable elements)
- Focus returns to the trigger element when the dialog closes
- Escape key closes the dialog
- Backdrop click does **not** close the dialog — user must choose an action
- Body scroll is locked while open
