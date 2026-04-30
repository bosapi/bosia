---
title: Combobox
description: A searchable select built on Popover + Command.
demo: ComboboxDemo
---

```bash
bosia add combobox
```

Convenience wrapper that composes `Popover` + `Command` into a single searchable select. No new dropdown or filter logic — it reuses the existing primitives and exposes a simple `items` API with a `bind:value`.

## Preview

## Props

| Prop                | Type                                                                          | Default                |
| ------------------- | ----------------------------------------------------------------------------- | ---------------------- |
| `items`             | `{ value: string; label: string; keywords?: string[]; disabled?: boolean }[]` | `[]`                   |
| `value`             | `string \| undefined` (bindable)                                              | `undefined`            |
| `placeholder`       | `string`                                                                      | `"Select item..."`     |
| `searchPlaceholder` | `string`                                                                      | `"Search..."`          |
| `emptyText`         | `string`                                                                      | `"No results found."`  |
| `disabled`          | `boolean`                                                                     | `false`                |
| `class`             | `string`                                                                      | `""` (trigger button)  |
| `contentClass`      | `string`                                                                      | `""` (popover content) |

`keywords` extend the search match for an item; `disabled` items are not selectable.

## Usage

```svelte
<script lang="ts">
	import { Combobox } from "$lib/components/ui/combobox";

	const frameworks = [
		{ value: "next", label: "Next.js", keywords: ["react"] },
		{ value: "sveltekit", label: "SvelteKit", keywords: ["svelte"] },
		{ value: "nuxt", label: "Nuxt", keywords: ["vue"] },
		{ value: "remix", label: "Remix", keywords: ["react"] },
		{ value: "astro", label: "Astro" },
		{ value: "bosia", label: "Bosia", keywords: ["svelte", "bun"] },
	];

	let value = $state<string | undefined>(undefined);
</script>

<Combobox
	items={frameworks}
	bind:value
	placeholder="Select framework..."
	searchPlaceholder="Search framework..."
	emptyText="No framework found."
	class="w-[220px]"
	contentClass="w-[220px] p-0"
/>
```

## Behavior

- Click the trigger to open the popover; click outside or press `Escape` to close.
- Type to filter items — matches run against each item's `value` and optional `keywords`.
- Selecting the currently selected item toggles it off (sets `value` to `undefined`).
- A check icon marks the selected item in the list.

## Composition

`Combobox` is a thin wrapper. Internally it renders:

```svelte
<Popover>
	<PopoverTrigger>...</PopoverTrigger>
	<PopoverContent>
		<Command>
			<CommandInput />
			<CommandList>
				<CommandEmpty />
				<CommandGroup>
					<CommandItem />
					...
				</CommandGroup>
			</CommandList>
		</Command>
	</PopoverContent>
</Popover>
```

If you need custom groups, headings, separators, or shortcut hints, drop down to `Popover` + `Command` directly instead of using `Combobox`.
