<script lang="ts">
	import { Search, Sun, Moon, GitBranch } from "@lucide/svelte";

	let dark = $state(false);

	const links = [{ label: "Guide" }, { label: "API" }, { label: "Examples" }];
</script>

<header
	class="flex h-16 w-full items-center justify-between gap-4 border-b border-border bg-card px-6 text-card-foreground"
>
	<div class="flex items-center gap-3">
		<a href="/" class="flex items-center gap-2">
			<div
				class="grid h-8 w-8 place-items-center rounded-md bg-primary font-display text-base font-extrabold text-primary-foreground"
			>
				B
			</div>
			<span class="flex flex-col leading-none">
				<span class="font-display text-base font-extrabold tracking-tight">__BRAND__</span>
				<span class="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
					>Docs</span
				>
			</span>
		</a>
		<span
			class="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground"
			>v2.1</span
		>
	</div>

	<label
		class="hidden h-9 max-w-xs flex-1 items-center gap-2 rounded-md border border-border bg-muted px-3 text-muted-foreground md:inline-flex"
	>
		<Search size={16} class="opacity-60" />
		<input
			type="search"
			placeholder="Search docs…"
			class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
		/>
	</label>

	<div class="flex items-center gap-4">
		<nav class="hidden items-center gap-4 md:flex">
			{#each links as link (link.label)}
				<a href="/" class="text-sm font-medium text-muted-foreground hover:text-foreground"
					>{link.label}</a
				>
			{/each}
		</nav>
		<span class="h-5 w-px bg-border"></span>
		<button
			type="button"
			onclick={() => (dark = !dark)}
			class="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
			aria-label="Toggle theme"
		>
			{#if dark}<Moon size={19} />{:else}<Sun size={19} />{/if}
		</button>
		<button
			type="button"
			class="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
			aria-label="Repository"><GitBranch size={19} /></button
		>
	</div>
</header>
