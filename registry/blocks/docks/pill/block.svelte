<script lang="ts">
	import { Home, Search, Heart, Bell, User } from "@lucide/svelte";

	type Item = { id: string; label: string; icon: typeof Home; badge?: number; dot?: boolean };

	const items: Item[] = [
		{ id: "home", label: "Home", icon: Home },
		{ id: "search", label: "Search", icon: Search },
		{ id: "saved", label: "Saved", icon: Heart, badge: 3 },
		{ id: "alerts", label: "Alerts", icon: Bell, dot: true },
		{ id: "profile", label: "Profile", icon: User },
	];

	let active = $state("home");
</script>

<div class="mx-auto flex w-full max-w-[390px] justify-center pb-4">
	<nav
		class="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-2 text-card-foreground shadow-lg"
	>
		{#each items as item (item.id)}
			{@const Icon = item.icon}
			<button
				type="button"
				onclick={() => (active = item.id)}
				aria-label={item.label}
				aria-current={active === item.id ? "page" : undefined}
				class="relative grid h-11 w-11 place-items-center rounded-full transition-colors {active ===
				item.id
					? 'bg-primary/10 text-primary'
					: 'text-muted-foreground'}"
			>
				<Icon size={22} />
				{#if item.badge}
					<span
						class="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 font-mono text-[10px] font-bold text-destructive-foreground"
						>{item.badge > 99 ? "99+" : item.badge}</span
					>
				{:else if item.dot}
					<span class="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
				{/if}
			</button>
		{/each}
	</nav>
</div>
