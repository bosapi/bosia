<script lang="ts">
	import { icons } from "$registry/icon/icons";

	const groupMap: Record<string, string> = {
		"arrow-left": "Navigation",
		"arrow-right": "Navigation",
		"arrow-up": "Navigation",
		"arrow-down": "Navigation",
		"chevron-left": "Navigation",
		"chevron-right": "Navigation",
		"chevron-up": "Navigation",
		"chevron-down": "Navigation",
		check: "Actions",
		x: "Actions",
		plus: "Actions",
		minus: "Actions",
		search: "Actions",
		filter: "Actions",
		"ellipsis-vertical": "Actions",
		menu: "UI",
		sun: "UI",
		moon: "UI",
		eye: "UI",
		"eye-off": "UI",
		settings: "UI",
		bell: "UI",
		trash: "UI",
		edit: "UI",
		copy: "UI",
		"panel-left": "Layout",
		"panel-right": "Layout",
		"layout-dashboard": "Layout",
		columns: "Layout",
		"circle-alert": "Status",
		"circle-check": "Status",
		"circle-x": "Status",
		info: "Status",
		loader: "Status",
		file: "Content",
		folder: "Content",
		image: "Content",
		download: "Content",
		upload: "Content",
		user: "User",
		users: "User",
		"log-out": "User",
		"log-in": "User",
		"message-square": "Communication",
		mail: "Communication",
		home: "Misc",
		"external-link": "Misc",
		link: "Misc",
		star: "Misc",
		heart: "Misc",
		globe: "Misc",
		calendar: "Misc",
		clock: "Misc",
	};

	const groupOrder = [
		"Navigation",
		"Actions",
		"UI",
		"Layout",
		"Status",
		"Content",
		"User",
		"Communication",
		"Misc",
	];

	const groups = $derived.by(() => {
		const result: Record<string, string[]> = {};
		for (const g of groupOrder) result[g] = [];
		for (const name of Object.keys(icons)) {
			const group = groupMap[name] || "Misc";
			if (!result[group]) result[group] = [];
			result[group].push(name);
		}
		return Object.entries(result).filter(([_, names]) => names.length > 0);
	});

	let toast = $state("");
	let toastVisible = $state(false);

	function copyName(name: string) {
		navigator.clipboard.writeText(name);
		toast = `Copied "${name}"`;
		toastVisible = true;
		setTimeout(() => {
			toastVisible = false;
		}, 1500);
	}
</script>

{#each groups as [group, names]}
	<div class="mb-6">
		<h3 class="text-base font-semibold mb-2">{group}</h3>
		<div class="grid grid-cols-9 gap-2">
			{#each names as name}
				<button
					onclick={() => copyName(name)}
					title={name}
					class="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-transparent text-foreground transition-all hover:border-primary hover:bg-accent cursor-pointer"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						{@html icons[name as keyof typeof icons]}
					</svg>
				</button>
			{/each}
		</div>
	</div>
{/each}

{#if toastVisible}
	<div
		class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium shadow-lg transition-all"
	>
		{toast}
	</div>
{/if}
