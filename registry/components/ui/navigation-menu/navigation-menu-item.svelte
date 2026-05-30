<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext, getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		children,
		...restProps
	}: {
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const nav = getContext<{
		value: string | null;
		open: (id: string) => void;
		scheduleClose: (id: string) => void;
		cancelClose: () => void;
		closeAll: () => void;
	}>("navigation-menu");

	const uid = $props.id();
	const id = `nm-${uid}`;

	setContext("navigation-menu-item", { id });
</script>

<li
	class={cn("relative", className)}
	onmouseenter={() => nav?.cancelClose()}
	onmouseleave={() => nav?.scheduleClose(id)}
	{...restProps}
>
	{@render children?.()}
</li>
