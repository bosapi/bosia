<script lang="ts">
	import LandingPage from "$lib/components/LandingPage.svelte";

	let { data }: { data: any } = $props();
</script>

<svelte:head>
	<title>Bosia</title>
	<meta
		name="description"
		content="Framework fullstack yang cepat dan lengkap, dibangun di atas Bun + Svelte 5 + ElysiaJS."
	/>
</svelte:head>

<LandingPage version={data.version} locale={data.locale} switchLocaleUrl={data.switchLocaleUrl} />
