<script lang="ts">
	import { Search, Bell } from "@lucide/svelte";

	const links = [
		{ label: "All", active: true },
		{ label: "Split" },
		{ label: "Glass" },
		{ label: "App bars" },
	];
</script>

<header
	class="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6 text-card-foreground"
>
	<div class="flex items-center gap-8">
		<a href="/" class="flex items-center gap-2.5">
			<div
				class="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
			>
				B
			</div>
			<span class="font-display text-lg font-extrabold tracking-tight">Brand</span>
		</a>
		<nav class="hidden items-center gap-5 md:flex">
			{#each links as link (link.label)}
				<a
					href="/"
					class="relative text-sm font-medium {link.active
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					{link.label}
					{#if link.active}
						<span class="absolute -bottom-2 left-0 right-0 h-0.5 rounded bg-primary"></span>
					{/if}
				</a>
			{/each}
		</nav>
	</div>

	<div class="flex items-center gap-3">
		<label
			class="hidden h-9 w-60 items-center gap-2 rounded-md border border-border bg-muted px-3 text-muted-foreground sm:inline-flex"
		>
			<Search size={16} class="opacity-60" />
			<input
				type="search"
				placeholder="Search navbars"
				class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
			/>
			<kbd class="font-mono text-xs opacity-60">⌘K</kbd>
		</label>
		<button
			type="button"
			class="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
			aria-label="Notifications"><Bell size={19} /></button
		>
		<span
			class="grid h-9 w-9 place-items-center rounded-full bg-foreground font-mono text-xs font-bold text-background"
			>JM</span
		>
	</div>
</header>
