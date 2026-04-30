<script lang="ts">
	let { error }: { error: { status: number; message: string } } = $props();
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="text-center">
		<h1 class="text-6xl font-bold text-foreground">{error.status}</h1>
		<p class="mt-4 text-lg text-muted-foreground">{error.message}</p>
		<a href="/" class="mt-6 inline-block text-sm text-primary underline underline-offset-2">
			Go home
		</a>
	</div>
</div>
