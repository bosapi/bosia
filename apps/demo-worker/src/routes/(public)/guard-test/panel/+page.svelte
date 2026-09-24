<script lang="ts">
	let { data } = $props();
</script>

<section class="mx-auto max-w-2xl space-y-4 px-4 py-10">
	<h1 class="text-2xl font-bold">Panel</h1>
	<p>Signed-out visitors must never see this: <code>{data.secret}</code></p>
</section>
