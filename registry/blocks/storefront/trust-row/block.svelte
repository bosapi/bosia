<script lang="ts">
	import type { Component } from "svelte";
	import { Truck, RotateCcw, ShieldCheck } from "@lucide/svelte";

	interface Item {
		icon: Component;
		text: string;
	}
	interface Props {
		items?: Item[];
	}

	let {
		items = [
			{ icon: Truck, text: "Free delivery over $50" },
			{ icon: RotateCcw, text: "30-day returns" },
			{ icon: ShieldCheck, text: "2-year guarantee" },
		],
	}: Props = $props();
</script>

<div class="flex flex-wrap gap-x-5 gap-y-3 border-y border-border py-4">
	{#each items as item (item.text)}
		<span class="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
			<item.icon size={18} strokeWidth={1.6} class="text-primary" />
			{item.text}
		</span>
	{/each}
</div>
