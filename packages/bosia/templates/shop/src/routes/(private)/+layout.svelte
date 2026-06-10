<script lang="ts">
	import { page } from "bosia/client";
	import AdminSidebar from "$lib/components/AdminSidebar.svelte";

	let { data, children }: { data: { user: { id: string; email: string } }; children: any } =
		$props();
</script>

<div class="flex min-h-screen">
	<AdminSidebar currentPath={page.url.pathname} user={data.user} />
	<main class="flex-1 overflow-x-hidden p-6">
		{@render children()}
	</main>
</div>
