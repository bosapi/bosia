<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Sun, Moon, Monitor } from "@lucide/svelte";

	let { class: className = "", ...restProps }: { class?: string; [key: string]: any } = $props();

	type ThemeMode = "light" | "dark" | "system";
	const ORDER: ThemeMode[] = ["light", "dark", "system"];
	let mode = $state<ThemeMode>("system");

	function applyTheme(m: ThemeMode) {
		if (typeof document === "undefined") return;
		const dark =
			m === "dark" || (m === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
		document.documentElement.classList.toggle("dark", dark);
	}

	// init from storage once, then apply it — applying (not just reading) is what keeps
	// the theme from resetting on refresh. writes mode, reads nothing reactive → runs once.
	$effect(() => {
		const stored = localStorage.getItem("theme") as ThemeMode | null;
		if (stored) mode = stored;
		applyTheme(mode);
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

<Button
	variant="ghost"
	size="icon"
	onclick={cycleTheme}
	aria-label={`Theme: ${mode}`}
	class={className}
	{...restProps}
>
	{#if mode === "light"}
		<Sun size={18} />
	{:else if mode === "dark"}
		<Moon size={18} />
	{:else}
		<Monitor size={18} />
	{/if}
</Button>
