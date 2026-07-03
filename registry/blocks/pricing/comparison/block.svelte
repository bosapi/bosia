<script lang="ts">
	import { Check, Minus } from "@lucide/svelte";

	const plans = [
		{ name: "Starter", price: "$0" },
		{ name: "Pro", price: "$24", featured: true },
		{ name: "Enterprise", price: "Custom" },
	];
	// per row: [Starter, Pro, Enterprise] — true / false / string
	const rows: { label: string; values: (boolean | string)[] }[] = [
		{ label: "Projects", values: ["3", "Unlimited", "Unlimited"] },
		{ label: "Storage", values: ["1 GB", "50 GB", "Unlimited"] },
		{ label: "Advanced analytics", values: [false, true, true] },
		{ label: "Custom domains", values: [false, true, true] },
		{ label: "Priority support", values: [false, true, true] },
		{ label: "SSO & SAML", values: [false, false, true] },
		{ label: "Audit logs", values: [false, false, true] },
	];
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div class="mx-auto max-w-2xl text-center">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary"
				>Compare plans</span
			>
			<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				Find the plan that fits
			</h2>
		</div>

		<div class="mt-12 overflow-x-auto">
			<table class="w-full min-w-[640px] border-collapse text-left">
				<thead>
					<tr class="border-b border-border">
						<th class="py-4 pr-4 text-sm font-medium text-muted-foreground">Features</th>
						{#each plans as plan (plan.name)}
							<th class="px-4 py-4 text-center">
								<div class="font-display text-base font-bold {plan.featured ? 'text-primary' : ''}">
									{plan.name}
								</div>
								<div class="text-sm font-normal text-muted-foreground">{plan.price}</div>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each rows as row (row.label)}
						<tr class="border-b border-border">
							<td class="py-3.5 pr-4 text-sm font-medium">{row.label}</td>
							{#each row.values as value, i (i)}
								<td class="px-4 py-3.5 text-center {plans[i].featured ? 'bg-primary/5' : ''}">
									{#if value === true}
										<Check size={18} class="mx-auto text-primary" />
									{:else if value === false}
										<Minus size={18} class="mx-auto text-muted-foreground/40" />
									{:else}
										<span class="text-sm text-foreground">{value}</span>
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>
