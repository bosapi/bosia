<script lang="ts">
	type ThemeMode = "light" | "dark" | "system";
	const ORDER: ThemeMode[] = ["light", "dark", "system"];
	let mode = $state<ThemeMode>("system");

	function applyTheme(m: ThemeMode) {
		if (typeof document === "undefined") return;
		const dark =
			m === "dark" || (m === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
		document.documentElement.classList.toggle("dark", dark);
	}

	// init from storage once (writes mode, reads nothing reactive → runs once, no read+write-same-state)
	$effect(() => {
		const stored = localStorage.getItem("theme") as ThemeMode | null;
		if (stored) mode = stored;
	});

	// keep DOM in sync with live OS changes while in system mode
	$effect(() => {
		if (mode !== "system" || typeof window === "undefined") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => applyTheme("system");
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	});

	function cycleTheme() {
		mode = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
		localStorage.setItem("theme", mode);
		applyTheme(mode);
	}
</script>

<button
	onclick={cycleTheme}
	class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
	aria-label={`Theme: ${mode}`}
>
	{#if mode === "light"}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path
				d="m4.93 4.93 1.41 1.41"
			/><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path
				d="m6.34 17.66-1.41 1.41"
			/><path d="m19.07 4.93-1.41 1.41" /></svg
		>
	{:else if mode === "dark"}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg
		>
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><rect width="20" height="14" x="2" y="3" rx="2" /><line
				x1="8"
				x2="16"
				y1="21"
				y2="21"
			/><line x1="12" x2="12" y1="17" y2="21" /></svg
		>
	{/if}
</button>
