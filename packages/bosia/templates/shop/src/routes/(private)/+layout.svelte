<script lang="ts">
	import { page } from "bosia/client";
	import AdminSidebar from "$lib/components/AdminSidebar.svelte";
	import {
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbPage,
		BreadcrumbSeparator,
	} from "$lib/components/ui/breadcrumb";

	let { data, children }: { data: { user: { id: string; email: string } }; children: any } =
		$props();

	const segments = $derived(page.url.pathname.split("/").filter(Boolean));
	const label = (s: string) => s[0].toUpperCase() + s.slice(1);
	const hrefAt = (i: number) => "/" + segments.slice(0, i + 1).join("/");
</script>

<div class="flex min-h-screen">
	<AdminSidebar currentPath={page.url.pathname} user={data.user} />
	<main class="flex-1 overflow-x-hidden p-6">
		{#if segments.length > 0}
			<Breadcrumb class="mb-4">
				<BreadcrumbList>
					{#each segments as segment, i}
						<BreadcrumbItem>
							{#if i === segments.length - 1}
								<BreadcrumbPage>{label(segment)}</BreadcrumbPage>
							{:else}
								<BreadcrumbLink href={hrefAt(i)}>{label(segment)}</BreadcrumbLink>
							{/if}
						</BreadcrumbItem>
						{#if i < segments.length - 1}
							<BreadcrumbSeparator />
						{/if}
					{/each}
				</BreadcrumbList>
			</Breadcrumb>
		{/if}
		{@render children()}
	</main>
</div>
