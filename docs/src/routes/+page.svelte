<script lang="ts">
	import LandingPage from "$lib/components/LandingPage.svelte";

	let { data }: { data: any } = $props();
</script>

<LandingPage version={data.version} locale={data.locale} switchLocaleUrl={data.switchLocaleUrl} />
