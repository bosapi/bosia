<script lang="ts">
	let { label = "or" }: { label?: string } = $props();
</script>

<div class="flex items-center gap-3">
	<span class="h-px flex-1 bg-border"></span>
	<span class="text-xs text-muted-foreground">{label}</span>
	<span class="h-px flex-1 bg-border"></span>
</div>
