<script lang="ts">
	import Page from "$pages/auth/sso/page.svelte";
</script>

<div class="flex w-full flex-col gap-8">
	<div class="w-full">
		<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
			Centered (default)
		</p>
		<div class="max-h-[80vh] w-full overflow-y-auto rounded-lg border border-border">
			<Page />
		</div>
	</div>
	<div class="w-full">
		<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
			Split (variant="split")
		</p>
		<div class="max-h-[80vh] w-full overflow-y-auto rounded-lg border border-border">
			<Page variant="split" />
		</div>
	</div>
</div>
