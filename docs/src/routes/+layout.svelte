<script lang="ts">
	import "../app.css";
	import { Toaster } from "$registry/sonner";
	let { children }: { children: any } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<script>
		if (
			localStorage.getItem("theme") === "dark" ||
			(!localStorage.getItem("theme") &&
				window.matchMedia("(prefers-color-scheme: dark)").matches)
		) {
			document.documentElement.classList.add("dark");
		}
	</script>
</svelte:head>

<Toaster />
{@render children()}
