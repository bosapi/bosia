---
name: bosia-drawer
description: Mobile bottom-sheet overlay — slides up from bottom, tap-to-close, focus trap, scroll lock. Use for mobile action sheets and pickers; use Dialog for desktop modals.
triggers:
  - drawer
  - bottom sheet
  - mobile action sheet
  - mobile modal
  - action sheet
  - picker sheet
od:
  mode: composition
  category: design
bosia:
  design: true
  requires:
    blocks: []
    themes: []
    components: [ui/drawer, ui/button]
    feats: []
  targets:
    routes: []
  stack: [svelte-5-runes, tailwind-v4]
---

# bosia-drawer

## What it builds

A bottom-pinned overlay that slides up from the bottom edge of the screen. Used for mobile action sheets, pickers, and confirmation flows where a centered Dialog feels wrong on small viewports.

## When to use

- **Drawer** — mobile or narrow viewport, action anchored to the bottom edge, picker UX
- **Dialog** — desktop, centered modal, constrained width

A common pattern: switch at a breakpoint — Dialog on `md+`, Drawer below.

## The contract

For any drawer surface:

```
open === false → nothing rendered (no portal, no backdrop)
open === true  → backdrop visible, panel slid up to translateY(0), body scroll locked, focus trapped
Escape         → close
click backdrop → close (unless closeOnBackdropClick={false})
DrawerClose    → close
DrawerTrigger  → toggle
```

This drawer is **tap-to-close only**. There is no drag gesture and no snap points. The handle bar at the top is decorative (`aria-hidden`).

## Required registry items

- `ui/drawer` — root, content, trigger, close, header, title, description, footer
- `ui/button` — trigger and footer actions

Install:

```bash
bosia add ui/drawer ui/button
```

## Canonical pattern

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
		<Button variant="outline">Open</Button>
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

## Rules

- **Always include `DrawerTitle`.** Required for `aria-labelledby`. If the title should be visually hidden, wrap it in `class="sr-only"`.
- **One `DrawerContent` per `Drawer` root.** Multiple contents share one context — the last one wins.
- **Do not nest a Drawer inside another Drawer.** Use a single drawer with conditional content if you need multi-step flows.
- **Mobile-first sizing.** The panel is full-width with `max-h-[85vh]`. Don't override these unless you know why.
- **Use Dialog, not Drawer, for desktop modals.** Drawer's bottom-pinned UX looks broken on wide viewports.
- **No drag.** If a designer asks for drag-to-dismiss or snap points, that's a separate component — not part of this drawer. Reach out before adding gestures here.

## Bosia conventions

- Component lives at `$lib/components/ui/drawer` after `bosia add ui/drawer`
- Zero npm dependencies — pure Svelte 5 runes + Tailwind v4
- Mirrors the Dialog API shape (`open` bindable, `closeOnBackdropClick`, sub-component naming) so consumers can swap Dialog ↔ Drawer with minimal churn

## Checklist gate

**P0 (blocks ship):**

- [ ] `DrawerTitle` present (a11y requirement)
- [ ] Escape closes
- [ ] Backdrop click closes (when `closeOnBackdropClick` not overridden)
- [ ] Body scroll locked while open
- [ ] Focus returns to trigger on close

**P1 (catch in review):**

- [ ] Trigger has clear affordance (not just an icon without `aria-label`)
- [ ] Footer actions ordered: primary action visually prominent, cancel via `DrawerClose`
- [ ] Long content scrolls inside the panel (don't rely on body scroll)
- [ ] Desktop layout considered — would Dialog be a better fit here?

## References

- Docs: `/docs/components/ui/drawer`
- Related: `bosia-dialog` (when present) for desktop modals
