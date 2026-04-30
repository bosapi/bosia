<script lang="ts">
	import { setSidebarContext, getSidebarContext } from "./context.ts";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();

	const parent = getSidebarContext();
	setSidebarContext({
		get collapsed() {
			return false;
		},
		toggle: parent.toggle,
	});
</script>

{@render children()}
