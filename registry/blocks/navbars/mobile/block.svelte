<script lang="ts">
	import { Menu, X, ChevronRight } from "@lucide/svelte";

	let open = $state(false);

	const items = ["Browse", "Layouts", "Themes", "Pricing", "Docs"];
</script>

<div
	class="mx-auto w-full max-w-[390px] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-md"
>
	<header class="flex items-center justify-between border-b border-border px-4" style="height:60px">
		<a href="/" class="flex items-center gap-2">
			<div
				class="grid h-7 w-7 place-items-center rounded-md bg-primary font-display text-sm font-extrabold text-primary-foreground"
			>
				B
			</div>
			<span class="font-display text-base font-extrabold tracking-tight">Brand</span>
		</a>
		<button
			type="button"
			onclick={() => (open = !open)}
			class="grid h-10 w-10 place-items-center rounded-md border border-border {open
				? 'bg-foreground text-background'
				: 'bg-card'}"
			aria-label="Toggle menu"
		>
			{#if open}<X size={20} />{:else}<Menu size={20} />{/if}
		</button>
	</header>

	{#if open}
		<div class="flex flex-col gap-0.5 p-3">
			{#each items as item, i (item)}
				<a
					href="/"
					class="flex items-center justify-between rounded-md px-3 py-3 text-base font-medium {i ===
					0
						? 'bg-accent'
						: ''}"
				>
					{item}
					<ChevronRight size={17} class="opacity-40" />
				</a>
			{/each}
			<div class="mt-2 flex gap-2.5">
				<button
					type="button"
					class="rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent"
					>Log in</button
				>
				<button
					type="button"
					class="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
					>Get started</button
				>
			</div>
		</div>
	{/if}
</div>
