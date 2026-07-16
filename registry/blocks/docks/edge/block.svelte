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

<nav
	class="mx-auto flex w-full max-w-[390px] items-center justify-around border-t border-border bg-card px-2 py-2 text-card-foreground shadow-md"
>
	{#each items as item (item.id)}
		{@const Icon = item.icon}
		<button
			type="button"
			onclick={() => (active = item.id)}
			aria-label={item.label}
			aria-current={active === item.id ? "page" : undefined}
			class="relative flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors {active ===
			item.id
				? 'bg-primary/10 text-primary'
				: 'text-muted-foreground'}"
		>
			<Icon size={22} />
			{#if item.badge}
				<span
					class="absolute right-2 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 font-mono text-[10px] font-bold text-destructive-foreground"
					>{item.badge > 99 ? "99+" : item.badge}</span
				>
			{:else if item.dot}
				<span class="absolute right-3.5 top-1.5 h-2 w-2 rounded-full bg-primary"></span>
			{/if}
			<span class="text-[11px] font-medium">{item.label}</span>
		</button>
	{/each}
</nav>
