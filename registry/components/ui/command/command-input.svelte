<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";

	let {
		class: className = "",
		placeholder = "Type a command or search...",
		...restProps
	}: {
		class?: string;
		placeholder?: string;
		[key: string]: any;
	} = $props();

	const command = getContext<{
		query: string;
		setQuery: (q: string) => void;
	}>("command");

	function oninput(e: Event) {
		command.setQuery((e.currentTarget as HTMLInputElement).value);
	}
</script>

<div class="flex items-center border-b px-3" data-command-input-wrapper>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="mr-2 size-4 shrink-0 opacity-50"
		aria-hidden="true"
	>
		<circle cx="11" cy="11" r="8" />
		<path d="m21 21-4.3-4.3" />
	</svg>
	<input
		type="text"
		role="combobox"
		aria-autocomplete="list"
		aria-expanded="true"
		autocomplete="off"
		autocorrect="off"
		spellcheck="false"
		value={command.query}
		{placeholder}
		{oninput}
		class={cn(
			"flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
			className,
		)}
		{...restProps}
	/>
</div>
