<script lang="ts">
	import { page } from "bosia/client";
	import PublicNavbar from "$lib/components/PublicNavbar.svelte";

	let { data, children }: { data: { user: any }; children: any } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<PublicNavbar currentPath={page.url.pathname} user={data.user} />
	<div class="flex-1">
		{@render children()}
	</div>
</div>
