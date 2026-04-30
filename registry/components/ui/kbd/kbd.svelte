<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { matchKeys } from "./shortcut.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		children,
		onPress,
		preventDefault = true,
		...restProps
	}: {
		class?: string;
		children?: Snippet;
		onPress?: (e: KeyboardEvent) => void;
		preventDefault?: boolean;
		[key: string]: any;
	} = $props();

	const inGroup = getContext<boolean>("kbd-group-has-shortcut");

	let el: HTMLElement;

	$effect(() => {
		if (!onPress || !el || inGroup) return;
		const keys = [el.textContent?.trim() ?? ""];
		const handler = (e: KeyboardEvent) => {
			if (matchKeys(keys, e)) {
				if (preventDefault) e.preventDefault();
				onPress!(e);
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	});
</script>

<kbd
	bind:this={el}
	class={cn(
		"inline-flex items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-muted-foreground",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</kbd>
