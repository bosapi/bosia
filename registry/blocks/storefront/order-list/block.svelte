<script lang="ts">
	import { ChevronRight } from "@lucide/svelte";
	import { money } from "$lib/blocks/storefront/store/store.svelte.ts";
	import {
		sampleOrders,
		type Order,
		type OrderStatus,
	} from "$lib/blocks/storefront/store/orders.ts";

	interface Props {
		orders?: Order[];
		onView?: (order: Order) => void;
	}

	let { orders = sampleOrders, onView }: Props = $props();

	const statusStyle: Record<OrderStatus, string> = {
		processing: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
		shipped: "bg-primary/10 text-primary",
		delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
		cancelled: "bg-muted text-muted-foreground",
	};
</script>

<div class="flex flex-col divide-y divide-border">
	{#each orders as order (order.id)}
		<button
			type="button"
			onclick={() => onView?.(order)}
			class="group flex w-full items-center gap-4 py-5 text-left first:pt-0 last:pb-0 sm:gap-6"
		>
			<div class="flex -space-x-3">
				{#each order.items.slice(0, 3) as item (item.name)}
					<div
						class="h-14 w-11 flex-none overflow-hidden rounded-lg border-2 border-background bg-muted"
					>
						{#if item.image}
							<img src={item.image} alt="" class="h-full w-full object-cover" />
						{/if}
					</div>
				{/each}
			</div>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
					<span class="font-mono text-[13px] text-muted-foreground">{order.id}</span>
					<span
						class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide {statusStyle[
							order.status
						]}"
					>
						{order.status}
					</span>
				</div>
				<div class="mt-1 truncate text-[15px] font-medium">
					{order.items.map((i) => i.name).join(", ")}
				</div>
				<div class="mt-0.5 text-[13px] text-muted-foreground/70">
					{order.date}{#if order.eta}
						· {order.eta}{/if}
				</div>
			</div>
			<span class="font-medium tabular-nums">{money(order.total)}</span>
			<ChevronRight
				size={17}
				class="flex-none text-muted-foreground/50 transition-transform group-hover:translate-x-0.5"
			/>
		</button>
	{/each}
</div>
