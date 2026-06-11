<script lang="ts">
	import "../app.css";
	import { Toaster } from "$registry/sonner";
	let { children }: { children: any } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<script>
		try {
			var t = localStorage.getItem("theme");
			document.documentElement.classList.toggle(
				"dark",
				t === "dark" ||
					((t === null || t === "system") &&
						window.matchMedia("(prefers-color-scheme: dark)").matches),
			);
		} catch (_) {}
	</script>
</svelte:head>

<Toaster />
{@render children()}
