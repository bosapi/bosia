---
title: Command
description: Primitif command palette yang bisa difilter dengan navigasi keyboard, grup, dan shortcut.
demo: CommandDemo
---

```bash
bun x bosia@latest add command
```

Primitif menu command yang cepat, komposabel, tanpa style. Gunakan untuk command palette, UI pencarian, dan blok pembangun `Combobox`.

## Preview

## Props

### Command

| Prop     | Type                                   | Default                                   |
| -------- | -------------------------------------- | ----------------------------------------- |
| `value`  | `string \| undefined` (bindable)       | `undefined`                               |
| `filter` | `(value, query, keywords?) => boolean` | kecocokan substring pada value + keywords |
| `class`  | `string`                               | `""`                                      |

### CommandInput

| Prop          | Type     | Default                         |
| ------------- | -------- | ------------------------------- |
| `placeholder` | `string` | `"Type a command or search..."` |
| `class`       | `string` | `""`                            |

### CommandItem

| Prop       | Type                      | Default     |
| ---------- | ------------------------- | ----------- |
| `value`    | `string` (wajib)          | —           |
| `keywords` | `string[]`                | `undefined` |
| `onSelect` | `(value: string) => void` | no-op       |
| `disabled` | `boolean`                 | `false`     |
| `class`    | `string`                  | `""`        |

### CommandGroup

| Prop      | Type     | Default     |
| --------- | -------- | ----------- |
| `heading` | `string` | `undefined` |
| `class`   | `string` | `""`        |

Grup otomatis tersembunyi via CSS `:has()` saat semua itemnya terfilter habis.

## Penggunaan

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

| Tombol                  | Aksi                                       |
| ----------------------- | ------------------------------------------ |
| `ArrowDown` / `ArrowUp` | Pindahkan sorotan                          |
| `Home` / `End`          | Lompat ke pertama / terakhir yang terlihat |
| `Enter`                 | Pilih item yang disorot                    |

## Filter Kustom

Timpa kecocokan substring default:

```svelte
<Command filter={(value, query) => value.startsWith(query)}>
	<!-- ... -->
</Command>
```
