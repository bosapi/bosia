<script lang="ts">
	import type { Snippet } from "svelte";
	import { CircleCheck, CircleAlert, Info } from "@lucide/svelte";

	interface Props {
		kind?: "success" | "error" | "info";
		children: Snippet;
	}

	let { kind = "info", children }: Props = $props();

	const styles = {
		success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
		error: "border-destructive/30 bg-destructive/10 text-destructive",
		info: "border-border bg-muted/50 text-muted-foreground",
	};
</script>

<div
	role="alert"
	class="flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm {styles[kind]}"
>
	{#if kind === "success"}
		<CircleCheck size={18} class="mt-px shrink-0" />
	{:else if kind === "error"}
		<CircleAlert size={18} class="mt-px shrink-0" />
	{:else}
		<Info size={18} class="mt-px shrink-0" />
	{/if}
	<span>{@render children()}</span>
</div>
