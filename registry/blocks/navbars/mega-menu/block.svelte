<script lang="ts">
	import {
		ChevronDown,
		LayoutPanelTop,
		PanelTop,
		Sidebar,
		SquareMenu,
		Sun,
		Moon,
		Sparkles,
		Square,
		TrendingUp,
		Sparkle,
		Bookmark,
		Gift,
	} from "@lucide/svelte";

	let open = $state(false);

	const cols = [
		{
			heading: "By layout",
			items: [
				{ icon: LayoutPanelTop, label: "Split" },
				{ icon: PanelTop, label: "Centered" },
				{ icon: Sidebar, label: "App bar" },
				{ icon: SquareMenu, label: "Mega-menu" },
			],
		},
		{
			heading: "By theme",
			items: [
				{ icon: Sun, label: "Light" },
				{ icon: Moon, label: "Dark" },
				{ icon: Sparkles, label: "Glass" },
				{ icon: Square, label: "Brutalist" },
			],
		},
		{
			heading: "Collections",
			items: [
				{ icon: TrendingUp, label: "Trending" },
				{ icon: Sparkle, label: "New this week" },
				{ icon: Bookmark, label: "Your saved" },
				{ icon: Gift, label: "Free pack" },
			],
		},
	];
</script>

<div class="relative w-full">
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
				<span class="font-display text-lg font-extrabold tracking-tight">__BRAND__</span>
			</a>
			<nav class="hidden items-center gap-6 md:flex">
				<button
					type="button"
					onclick={() => (open = !open)}
					class="inline-flex items-center gap-1.5 text-sm font-medium {open
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Catalog
					<ChevronDown size={15} class="transition-transform {open ? 'rotate-180' : ''}" />
				</button>
				<a href="/" class="text-sm font-medium text-muted-foreground hover:text-foreground"
					>Pricing</a
				>
				<a href="/" class="text-sm font-medium text-muted-foreground hover:text-foreground">Docs</a>
			</nav>
		</div>
		<button
			type="button"
			class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
			>Get started</button
		>
	</header>

	{#if open}
		<div
			class="absolute left-6 right-6 top-full z-20 mt-2 grid grid-cols-1 gap-6 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-xl sm:grid-cols-3"
		>
			{#each cols as col (col.heading)}
				<div>
					<div class="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
						{col.heading}
					</div>
					<div class="flex flex-col gap-0.5">
						{#each col.items as item (item.label)}
							{@const Icon = item.icon}
							<a
								href="/"
								class="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-accent"
							>
								<Icon size={17} class="opacity-60" />
								{item.label}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
