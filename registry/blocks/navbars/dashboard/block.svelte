<script lang="ts">
	import { Search, ChevronDown, Plus, Bell, Settings } from "@lucide/svelte";
</script>

<header
	class="flex h-16 w-full items-center justify-between gap-4 border-b border-border bg-card px-6 text-card-foreground"
>
	<div class="flex items-center gap-3">
		<a href="/" class="flex items-center gap-2">
			<div
				class="grid h-7 w-7 place-items-center rounded-md bg-primary font-display text-sm font-extrabold text-primary-foreground"
			>
				B
			</div>
			<span class="font-display text-base font-extrabold tracking-tight">Brand</span>
		</a>
		<span class="text-muted-foreground/50">/</span>
		<button type="button" class="inline-flex items-center gap-1.5 text-sm font-semibold">
			Watchlist <ChevronDown size={15} class="opacity-50" />
		</button>
	</div>

	<label
		class="hidden h-9 max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-muted px-3 text-muted-foreground md:inline-flex"
	>
		<Search size={16} class="opacity-60" />
		<input
			type="search"
			placeholder="Search…"
			class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
		/>
	</label>

	<div class="flex items-center gap-1">
		<button
			type="button"
			class="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
			aria-label="New"><Plus size={19} /></button
		>
		<button
			type="button"
			class="relative grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
			aria-label="Notifications"
		>
			<Bell size={19} />
			<span
				class="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground"
				>3</span
			>
		</button>
		<button
			type="button"
			class="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
			aria-label="Settings"><Settings size={19} /></button
		>
		<span class="mx-1.5 h-6 w-px bg-border"></span>
		<span
			class="grid h-9 w-9 place-items-center rounded-full bg-foreground font-mono text-xs font-bold text-background"
			>JM</span
		>
	</div>
</header>
