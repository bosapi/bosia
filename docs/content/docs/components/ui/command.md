---
title: Command
description: A filterable command palette primitive with keyboard navigation, groups, and shortcuts.
demo: CommandDemo
---

```bash
bosia add command
```

Fast, composable, unstyled command menu primitive. Use for command palettes, search UIs, and the building blocks of `Combobox`.

## Preview

## Props

### Command

| Prop     | Type                                   | Default                             |
| -------- | -------------------------------------- | ----------------------------------- |
| `value`  | `string \| undefined` (bindable)       | `undefined`                         |
| `filter` | `(value, query, keywords?) => boolean` | substring match on value + keywords |
| `class`  | `string`                               | `""`                                |

### CommandInput

| Prop          | Type     | Default                         |
| ------------- | -------- | ------------------------------- |
| `placeholder` | `string` | `"Type a command or search..."` |
| `class`       | `string` | `""`                            |

### CommandItem

| Prop       | Type                      | Default     |
| ---------- | ------------------------- | ----------- |
| `value`    | `string` (required)       | —           |
| `keywords` | `string[]`                | `undefined` |
| `onSelect` | `(value: string) => void` | no-op       |
| `disabled` | `boolean`                 | `false`     |
| `class`    | `string`                  | `""`        |

### CommandGroup

| Prop      | Type     | Default     |
| --------- | -------- | ----------- |
| `heading` | `string` | `undefined` |
| `class`   | `string` | `""`        |

Groups auto-hide via CSS `:has()` when all their items are filtered out.

## Usage

```svelte
<script lang="ts">
	import {
		Command,
		CommandInput,
		CommandList,
		CommandEmpty,
		CommandGroup,
		CommandItem,
		CommandSeparator,
		CommandShortcut,
	} from "$lib/components/ui/command";
</script>

<Command>
	<CommandInput placeholder="Type a command or search..." />
	<CommandList>
		<CommandEmpty />
		<CommandGroup heading="Suggestions">
			<CommandItem value="calendar">Calendar</CommandItem>
			<CommandItem value="search-emoji">Search Emoji</CommandItem>
		</CommandGroup>
		<CommandSeparator />
		<CommandGroup heading="Settings">
			<CommandItem value="profile">
				Profile
				<CommandShortcut>⌘P</CommandShortcut>
			</CommandItem>
		</CommandGroup>
	</CommandList>
</Command>
```

## Keyboard

| Key                     | Action                       |
| ----------------------- | ---------------------------- |
| `ArrowDown` / `ArrowUp` | Move highlight               |
| `Home` / `End`          | Jump to first / last visible |
| `Enter`                 | Select highlighted item      |

## Custom Filter

Override the default substring match:

```svelte
<Command filter={(value, query) => value.startsWith(query)}>
	<!-- ... -->
</Command>
```
