<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	let { children }: { children: any } = $props();

	// Hydration signal for test/ui.e2e.ts — the framework exposes none.
	onMount(() => {
		document.documentElement.dataset.hydrated = "";
	});
</script>

<div data-bosia-preload="hover">
	{@render children()}
</div>
