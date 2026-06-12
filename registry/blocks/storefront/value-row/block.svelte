<script lang="ts">
	import type { Component } from "svelte";
	import { Truck, ShieldCheck, Sparkles, HeartHandshake } from "@lucide/svelte";

	interface Value {
		icon: Component;
		title: string;
		body: string;
	}
	interface Props {
		values?: Value[];
	}

	let {
		values = [
			{
				icon: Truck,
				title: "Free delivery over $50",
				body: "Carbon-neutral shipping on every order, returned free within 30 days.",
			},
			{
				icon: ShieldCheck,
				title: "Quality, guaranteed",
				body: "Everything we sell is vetted by our team and backed by our promise.",
			},
			{
				icon: Sparkles,
				title: "Thoughtfully sourced",
				body: "We partner with makers and growers who share our standards.",
			},
			{
				icon: HeartHandshake,
				title: "Here to help",
				body: "Real people, real answers — by chat, email or phone, seven days a week.",
			},
		],
	}: Props = $props();
</script>

<section class="bg-muted/40 py-16 sm:py-20">
	<div class="mx-auto w-full max-w-6xl px-6">
		<div class="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
			{#each values as value (value.title)}
				<div class="flex flex-col gap-2">
					<value.icon size={30} strokeWidth={1.6} class="text-primary" />
					<h4 class="text-[17px] font-semibold tracking-tight">{value.title}</h4>
					<p class="text-sm text-muted-foreground">{value.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
