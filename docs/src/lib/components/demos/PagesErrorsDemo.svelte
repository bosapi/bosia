<script lang="ts">
	import NotFound from "$pages/errors/not-found/page.svelte";
	import ServerError from "$pages/errors/server-error/page.svelte";
	import Maintenance from "$pages/errors/maintenance/page.svelte";
</script>

<div class="max-h-[80vh] space-y-6 overflow-y-auto rounded-lg border border-border bg-muted/30 p-6">
	<div class="overflow-hidden rounded-lg border border-border"><NotFound /></div>
	<div class="overflow-hidden rounded-lg border border-border"><ServerError /></div>
	<div class="overflow-hidden rounded-lg border border-border">
		<Maintenance contactEmail="jeki@bosia.dev" />
	</div>
</div>
