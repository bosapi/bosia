<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { icons, type IconName } from "./icons.ts";

	let {
		name,
		size = 18,
		class: className = "",
		...restProps
	}: {
		name: IconName;
		size?: number;
		class?: string;
		[key: string]: any;
	} = $props();
</script>

<svg
	class={cn(className)}
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	{...restProps}
>
	{@html icons[name]}
</svg>
