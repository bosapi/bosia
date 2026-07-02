<script lang="ts">
	import { ArrowLeft, Package, Box, Truck, House } from "@lucide/svelte";
	import { money } from "$lib/blocks/storefront/store/store.svelte.ts";
	import {
		sampleOrders,
		sampleAddresses,
		type Address,
		type Order,
	} from "$lib/blocks/storefront/store/orders.ts";

	interface Props {
		order?: Order;
		address?: Address;
		onBack?: () => void;
	}

	let { order = sampleOrders[0], address = sampleAddresses[0], onBack }: Props = $props();

	const stepIcons = [Package, Box, Truck, House];
	const subtotal = $derived(order.items.reduce((sum, x) => sum + x.price * x.qty, 0));
	const shipping = $derived(order.total - subtotal);

	// Progress line spans up to the last completed step.
	const progress = $derived.by(() => {
		const steps = order.tracking ?? [];
		const done = steps.filter((s) => s.done).length;
		return steps.length > 1 ? ((done - 1) / (steps.length - 1)) * 100 : 0;
	});
</script>

<div class="flex flex-col gap-7">
	<div>
		<button
			type="button"
			onclick={onBack}
			class="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft size={15} /> Back to orders
		</button>
		<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
			<h2 class="font-display text-2xl tracking-tight">Order {order.id}</h2>
			<span class="text-sm text-muted-foreground/70">Placed {order.date}</span>
		</div>
		{#if order.eta}
			<p class="mt-1 text-[15px] font-medium text-primary">{order.eta}</p>
		{/if}
	</div>

	{#if order.tracking?.length}
		<div class="rounded-xl border border-border bg-card p-6">
			<div class="relative flex justify-between">
				<span class="absolute left-[17px] right-[17px] top-[17px] h-0.5 bg-border"></span>
				<span
					class="absolute left-[17px] top-[17px] h-0.5 bg-primary"
					style="width: calc((100% - 34px) * {progress / 100})"
				></span>
				{#each order.tracking as step, i (step.label)}
					{@const Icon = stepIcons[i % stepIcons.length]}
					<div class="z-[1] flex flex-col items-center gap-1.5">
						<span
							class="flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-card {step.done
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground/70'}"
						>
							<Icon size={16} />
						</span>
						<span
							class="text-[11px] font-semibold {step.done
								? 'text-foreground'
								: 'text-muted-foreground/70'}"
						>
							{step.label}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="grid items-start gap-7 lg:grid-cols-[1.5fr_1fr]">
		<div class="flex flex-col divide-y divide-border">
			{#each order.items as item (item.name)}
				<div class="flex items-center gap-4 py-4 first:pt-0">
					<div class="h-16 w-[52px] flex-none overflow-hidden rounded-lg bg-muted">
						{#if item.image}
							<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
						{/if}
					</div>
					<div class="flex-1">
						<div class="text-[15px] font-medium">{item.name}</div>
						<div class="text-[13px] text-muted-foreground/70">{item.category} · Qty {item.qty}</div>
					</div>
					<span class="font-medium tabular-nums">{money(item.price * item.qty)}</span>
				</div>
			{/each}

			<div class="flex flex-col gap-1.5 pt-4">
				<div class="flex justify-between text-muted-foreground">
					<span>Subtotal</span>
					<span class="font-medium tabular-nums text-foreground">{money(subtotal)}</span>
				</div>
				<div class="flex justify-between text-muted-foreground">
					<span>Shipping</span>
					<span class="font-medium tabular-nums text-foreground"
						>{shipping <= 0 ? "Free" : money(shipping)}</span
					>
				</div>
				<div class="mt-1.5 flex justify-between border-t border-border pt-3 text-lg font-bold">
					<span>Total</span>
					<span class="tabular-nums">{money(order.total)}</span>
				</div>
			</div>
		</div>

		<div class="rounded-xl border border-border bg-muted/40 p-5">
			<h4 class="mb-2.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
				Shipping address
			</h4>
			<p class="text-[15px] leading-relaxed">
				{address.name}<br />
				{address.line1}<br />
				{address.city}
				{address.zip}<br />
				{address.country}
			</p>
		</div>
	</div>
</div>
