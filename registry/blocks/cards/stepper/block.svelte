<script lang="ts">
	import { Check } from "@lucide/svelte";

	const steps = [
		{ label: "Create workspace", state: "done" },
		{ label: "Pick a theme", state: "active" },
		{ label: "Invite the team", state: "todo" },
		{ label: "Ship your first card", state: "todo" },
	];
</script>

<div
	class="flex w-full max-w-[260px] flex-col rounded-xl border border-border bg-card p-5 text-card-foreground shadow-md"
>
	<div class="font-display text-[17px] font-bold">Get set up</div>
	<div class="mb-[18px] text-xs text-muted-foreground/70">2 of 4 complete</div>
	<div class="flex flex-col">
		{#each steps as step, i (step.label)}
			<div class="relative flex items-start gap-3.5 {i < steps.length - 1 ? 'pb-[18px]' : ''}">
				{#if i < steps.length - 1}
					<span
						class="absolute bottom-0 left-3 top-6 w-0.5 {step.state === 'done'
							? 'bg-primary'
							: 'bg-border'}"
					></span>
				{/if}
				<span
					class="z-[1] flex h-[25px] w-[25px] flex-none items-center justify-center rounded-full {step.state ===
					'done'
						? 'bg-primary text-primary-foreground'
						: step.state === 'active'
							? 'border-2 border-primary bg-primary/10 text-primary'
							: 'bg-muted text-primary'}"
				>
					{#if step.state === "done"}
						<Check size={14} />
					{:else}
						<span class="font-mono text-xs font-bold">{i + 1}</span>
					{/if}
				</span>
				<div class="pt-0.5">
					<div
						class="text-sm {step.state === 'todo'
							? 'font-medium text-muted-foreground'
							: 'font-semibold'}"
					>
						{step.label}
					</div>
					{#if step.state === "active"}
						<div class="mt-0.5 text-xs text-primary">In progress</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
