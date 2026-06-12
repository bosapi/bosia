<script lang="ts">
	import { money } from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		subtotal?: number;
		/** Two-way bindable delivery choice: "standard" | "express". */
		delivery?: "standard" | "express";
	}

	let { subtotal = 102, delivery = $bindable("standard") }: Props = $props();

	const standardCost = $derived(subtotal >= 50 ? 0 : 6);
</script>

{#snippet field(label: string, placeholder: string, type = "text", span = false)}
	<div class="flex flex-col gap-1.5 {span ? 'sm:col-span-2' : ''}">
		<label class="text-[13px] font-semibold text-muted-foreground" for={label}>{label}</label>
		<input
			id={label}
			{type}
			{placeholder}
			class="rounded-lg border border-border bg-card px-3.5 py-3 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
		/>
	</div>
{/snippet}

<form class="flex flex-col gap-5">
	<!-- 1. Contact -->
	<section class="rounded-xl border border-border bg-card p-6 sm:p-8">
		<h3 class="mb-[18px] flex items-center gap-2.5 font-display text-[22px]">
			<span
				class="grid h-7 w-7 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
				>1</span
			> Contact
		</h3>
		<div class="grid gap-4 sm:grid-cols-2">
			{@render field("Email", "you@example.com", "email", true)}
			{@render field("First name", "Jeki")}
			{@render field("Last name", "Maulana")}
		</div>
	</section>

	<!-- 2. Shipping address -->
	<section class="rounded-xl border border-border bg-card p-6 sm:p-8">
		<h3 class="mb-[18px] flex items-center gap-2.5 font-display text-[22px]">
			<span
				class="grid h-7 w-7 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
				>2</span
			> Shipping address
		</h3>
		<div class="grid gap-4 sm:grid-cols-2">
			{@render field("Address", "123 Market Street", "text", true)}
			{@render field("City", "Portland")}
			{@render field("Postcode", "97201")}
			{@render field("Country", "United States", "text", true)}
		</div>
	</section>

	<!-- 3. Delivery -->
	<section class="rounded-xl border border-border bg-card p-6 sm:p-8">
		<h3 class="mb-[18px] flex items-center gap-2.5 font-display text-[22px]">
			<span
				class="grid h-7 w-7 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
				>3</span
			> Delivery
		</h3>
		<button
			type="button"
			onclick={() => (delivery = "standard")}
			class="mb-2.5 flex w-full items-center gap-3.5 rounded-lg border-[1.5px] p-4 text-left transition {delivery ===
			'standard'
				? 'border-primary bg-primary/10'
				: 'border-border hover:border-muted-foreground/50'}"
		>
			<span
				class="grid h-5 w-5 flex-none place-items-center rounded-full border-2 {delivery ===
				'standard'
					? 'border-primary'
					: 'border-input'}"
			>
				{#if delivery === "standard"}<span class="h-2.5 w-2.5 rounded-full bg-primary"></span>{/if}
			</span>
			<span class="flex-1">
				<span class="block font-semibold">Standard delivery</span>
				<span class="block text-sm text-muted-foreground/70"
					>3–5 business days · carbon neutral</span
				>
			</span>
			<span class="font-medium tabular-nums">{standardCost === 0 ? "Free" : money(6)}</span>
		</button>
		<button
			type="button"
			onclick={() => (delivery = "express")}
			class="flex w-full items-center gap-3.5 rounded-lg border-[1.5px] p-4 text-left transition {delivery ===
			'express'
				? 'border-primary bg-primary/10'
				: 'border-border hover:border-muted-foreground/50'}"
		>
			<span
				class="grid h-5 w-5 flex-none place-items-center rounded-full border-2 {delivery ===
				'express'
					? 'border-primary'
					: 'border-input'}"
			>
				{#if delivery === "express"}<span class="h-2.5 w-2.5 rounded-full bg-primary"></span>{/if}
			</span>
			<span class="flex-1">
				<span class="block font-semibold">Express delivery</span>
				<span class="block text-sm text-muted-foreground/70">1–2 business days</span>
			</span>
			<span class="font-medium tabular-nums">{money(12)}</span>
		</button>
	</section>

	<!-- 4. Payment -->
	<section class="rounded-xl border border-border bg-card p-6 sm:p-8">
		<h3 class="mb-[18px] flex items-center gap-2.5 font-display text-[22px]">
			<span
				class="grid h-7 w-7 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
				>4</span
			> Payment
		</h3>
		<div class="grid gap-4 sm:grid-cols-2">
			{@render field("Card number", "1234 5678 9012 3456", "text", true)}
			{@render field("Expiry", "MM / YY")}
			{@render field("CVC", "123")}
			{@render field("Name on card", "Jeki Maulana", "text", true)}
		</div>
	</section>
</form>
