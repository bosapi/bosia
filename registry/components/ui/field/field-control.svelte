<script lang="ts">
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		child,
	}: {
		child: Snippet<[{ id: string; "aria-describedby": string; "aria-invalid": boolean }]>;
	} = $props();

	const ctx = getContext<{
		id: string;
		descriptionId: string;
		errorId: string;
		error?: string;
	}>("field");
</script>

{@render child({
	id: ctx.id,
	"aria-describedby": [ctx.descriptionId, ctx.error ? ctx.errorId : ""].filter(Boolean).join(" "),
	"aria-invalid": !!ctx.error,
})}
