<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { matchKeys } from "./shortcut.ts";
	import { setContext } from "svelte";
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

	if (onPress) setContext("kbd-group-has-shortcut", true);

	let el: HTMLElement;

	$effect(() => {
		if (!onPress || !el) return;
		const kbds = el.querySelectorAll("kbd");
		const keys = Array.from(kbds, (kbd) => kbd.textContent?.trim() ?? "");
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

<span
	bind:this={el}
	class={cn(
		"inline-flex items-center gap-1 [&>:not(:first-child)]:before:mr-1 [&>:not(:first-child)]:before:content-['+'] [&>:not(:first-child)]:before:text-xs [&>:not(:first-child)]:before:text-muted-foreground",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</span>
