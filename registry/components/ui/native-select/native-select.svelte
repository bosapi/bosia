<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		value = $bindable(""),
		disabled = false,
		id = undefined as string | undefined,
		name = undefined as string | undefined,
		children,
		...restProps
	}: {
		class?: string;
		value?: string;
		disabled?: boolean;
		id?: string;
		name?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<select
	bind:value
	{id}
	{name}
	{disabled}
	class={cn(
		"flex h-8 w-full appearance-none rounded-md border border-input bg-background px-3 py-1.5 pr-8 text-sm transition-colors",
		"bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat",
		"bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
		"focus:outline-none focus:border-primary",
		"disabled:cursor-not-allowed disabled:opacity-50",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</select>
