<script lang="ts">
	import { ChevronDown } from "@lucide/svelte";

	interface Item {
		title: string;
		body: string;
		open?: boolean;
	}
	interface Props {
		items?: Item[];
	}

	let {
		items = [
			{
				title: "Details & materials",
				body: "Crafted from responsibly sourced materials. Each piece is finished by hand, so slight variations are part of the character. Full specifications and care included.",
				open: true,
			},
			{
				title: "Shipping & returns",
				body: "Carbon-neutral delivery on every order, free over $50. Returns are free within 30 days — no questions asked.",
			},
			{
				title: "How we make it",
				body: "Made in small batches with makers we've worked with for years. We tell you exactly where everything comes from.",
			},
		],
	}: Props = $props();
</script>

<div>
	{#each items as item (item.title)}
		<details class="group border-t border-border" open={item.open}>
			<summary
				class="flex cursor-pointer list-none items-center justify-between py-[18px] font-semibold [&::-webkit-details-marker]:hidden"
			>
				{item.title}
				<ChevronDown size={18} class="transition-transform group-open:rotate-180" />
			</summary>
			<p class="pb-[18px] text-[15px] text-muted-foreground">{item.body}</p>
		</details>
	{/each}
</div>
