<script lang="ts">
	import { Package, MapPin, Settings, LogOut } from "@lucide/svelte";

	interface NavItem {
		key: string;
		label: string;
		icon: typeof Package;
	}

	interface Props {
		user?: { name: string; email: string };
		items?: NavItem[];
		/** Two-way bindable key of the active section. */
		active?: string;
		onSignOut?: () => void;
	}

	let {
		user = { name: "Jeki Maulana", email: "jeki@bosia.dev" },
		items = [
			{ key: "orders", label: "Orders", icon: Package },
			{ key: "addresses", label: "Addresses", icon: MapPin },
			{ key: "settings", label: "Settings", icon: Settings },
		],
		active = $bindable("orders"),
		onSignOut,
	}: Props = $props();

	const initials = $derived(
		user.name
			.split(" ")
			.map((part) => part[0])
			.slice(0, 2)
			.join("")
			.toUpperCase(),
	);
</script>

<nav class="flex flex-col gap-6" aria-label="Account">
	<div class="flex items-center gap-3">
		<span
			class="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary"
		>
			{initials}
		</span>
		<div class="min-w-0">
			<div class="truncate text-[15px] font-semibold">{user.name}</div>
			<div class="truncate text-[13px] text-muted-foreground/70">{user.email}</div>
		</div>
	</div>

	<div class="flex flex-row gap-1 overflow-x-auto lg:flex-col">
		{#each items as item (item.key)}
			<button
				type="button"
				onclick={() => (active = item.key)}
				class="inline-flex flex-none items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-colors {active ===
				item.key
					? 'bg-muted text-foreground'
					: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
			>
				<item.icon size={17} />
				{item.label}
			</button>
		{/each}
		<button
			type="button"
			onclick={onSignOut}
			class="inline-flex flex-none items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-destructive lg:mt-2"
		>
			<LogOut size={17} />
			Sign out
		</button>
	</div>
</nav>
