<script lang="ts">
	import { Package, Truck, Navigation, House } from "@lucide/svelte";

	const steps = [
		{ label: "Ordered", icon: Package, done: true },
		{ label: "Shipped", icon: Truck, done: true },
		{ label: "Out", icon: Navigation, done: true },
		{ label: "Delivered", icon: House, done: false },
	];
</script>

<div
	class="flex w-full max-w-[320px] flex-col rounded-xl border border-border bg-card p-5 text-card-foreground shadow-md"
>
	<div class="mb-1 flex items-center justify-between">
		<span class="font-mono text-xs text-muted-foreground">#CS-2041</span>
		<span
			class="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-emerald-600 dark:text-emerald-400"
		>
			On the way
		</span>
	</div>
	<div class="mb-1 mt-1.5 font-display text-[17px] font-bold">Arrives today</div>
	<div class="mb-5 text-[13px] text-muted-foreground">Estimated 4:30 – 5:00 PM</div>

	<div class="relative flex justify-between">
		<span class="absolute left-[17px] right-[17px] top-[17px] h-0.5 bg-border"></span>
		<span class="absolute left-[17px] top-[17px] h-0.5 w-[62%] bg-primary"></span>
		{#each steps as step (step.label)}
			<div class="z-[1] flex flex-col items-center gap-1.5">
				<span
					class="flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-card {step.done
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground/70'}"
				>
					<step.icon size={16} />
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
