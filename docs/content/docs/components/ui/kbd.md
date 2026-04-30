---
title: Kbd
description: Displays keyboard shortcut keys with a keycap style. Optionally binds actual keyboard shortcuts via onPress.
demo: KbdDemo
---

```bash
bosia add kbd
```

Renders a styled `<kbd>` element that looks like a keycap. Use `KbdGroup` to display key combinations with "+" separators.

Pass `onPress` to bind an actual keyboard shortcut — keys are automatically inferred from the rendered content.

## Preview

## Props

### Kbd

| Prop             | Type                         | Default |
| ---------------- | ---------------------------- | ------- |
| `class`          | `string`                     | `""`    |
| `onPress`        | `(e: KeyboardEvent) => void` | —       |
| `preventDefault` | `boolean`                    | `true`  |

### KbdGroup

| Prop             | Type                         | Default |
| ---------------- | ---------------------------- | ------- |
| `class`          | `string`                     | `""`    |
| `onPress`        | `(e: KeyboardEvent) => void` | —       |
| `preventDefault` | `boolean`                    | `true`  |

## Usage

```svelte
<script lang="ts">
	import { Kbd, KbdGroup } from "$lib/components/ui/kbd";
</script>

<Kbd>K</Kbd>

<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>

<KbdGroup><Kbd>Ctrl</Kbd><Kbd>Shift</Kbd><Kbd>P</Kbd></KbdGroup>
```

## Keyboard Shortcuts

Pass `onPress` to make the component listen for the displayed key combination. No explicit `keys` prop needed — the keys are inferred from the rendered `<kbd>` text content.

```svelte
<script lang="ts">
	import { Kbd, KbdGroup } from "$lib/components/ui/kbd";
</script>

<!-- Single key -->
<Kbd onPress={() => console.log("K pressed!")}>K</Kbd>

<!-- Combination — fires when Ctrl+K is pressed -->
<KbdGroup onPress={() => console.log("Ctrl+K!")}>
	<Kbd>Ctrl</Kbd><Kbd>K</Kbd>
</KbdGroup>

<!-- Display only (no listener) -->
<Kbd>Esc</Kbd>
```

Modifier keys are recognized automatically: `Ctrl`, `Control`, `Shift`, `Alt`, `Option`, `Meta`, `Cmd`, `⌘`, `Command`, `Win`.

Set `preventDefault={false}` to allow the browser default behavior for the key combination.

When `KbdGroup` has `onPress`, child `Kbd` listeners are automatically suppressed — only the group-level shortcut fires.
