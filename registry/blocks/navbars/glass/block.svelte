<script lang="ts">
	import { Search } from "@lucide/svelte";

	const links = [
		{ label: "Browse", active: true },
		{ label: "Layouts" },
		{ label: "Themes" },
		{ label: "Pricing" },
	];
</script>

<div class="relative w-full bg-background">
	<!-- Decorative tint so the blur has something to read against -->
	<div
		class="pointer-events-none absolute right-12 top-0 h-28 w-72 rounded-full bg-primary/30 blur-3xl"
		aria-hidden="true"
	></div>

	<header
		class="relative flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/60 px-6 text-foreground backdrop-blur-xl"
	>
		<div class="flex items-center gap-8">
			<a href="/" class="flex items-center gap-2.5">
				<div
					class="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
				>
					B
				</div>
				<span class="font-display text-lg font-extrabold tracking-tight">__BRAND__</span>
			</a>
			<nav class="hidden items-center gap-7 md:flex">
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

		<div class="flex items-center gap-2.5">
			<label
				class="hidden h-9 w-48 items-center gap-2 rounded-md border border-border/60 bg-background/50 px-3 text-muted-foreground sm:inline-flex"
			>
				<Search size={16} class="opacity-60" />
				<input
					type="search"
					placeholder="Search"
					class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
				/>
			</label>
			<button
				type="button"
				class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
				>Get started</button
			>
		</div>
	</header>
</div>
