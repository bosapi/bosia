<script lang="ts">
	import type { LayoutProps } from "./$types";
	let { children, data }: LayoutProps = $props();
</script>

<section class="space-y-4">
	<div
		class="flex items-center justify-between border-b pb-2 text-xs text-muted-foreground font-mono"
	>
		<span>section: {data.section}</span>
		<span>{data.appName}</span>
	</div>
	{@render children()}
</section>
