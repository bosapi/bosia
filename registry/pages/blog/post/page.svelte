<script lang="ts">
	import Navbar from "$lib/blocks/navbars/minimal/block.svelte";
	import PostHeader from "$lib/blocks/blog/post-header/block.svelte";
	import PostBody from "$lib/blocks/blog/post-body/block.svelte";
	import Related from "$lib/blocks/blog/related/block.svelte";
	import Footer from "$lib/blocks/footers/minimal/block.svelte";

	type Post = {
		slug: string;
		title: string;
		tag: string;
		date: string;
		datetime: string;
	};

	// all props optional — the blocks ship a sample post; feed them from a server loader when ready
	let {
		post,
		bodyHtml,
		related,
	}: {
		post?: {
			tag?: string;
			title?: string;
			excerpt?: string;
			author?: string;
			date?: string;
			datetime?: string;
			cover?: string;
		};
		bodyHtml?: string;
		related?: Post[];
	} = $props();
</script>

<div class="flex min-h-screen flex-col bg-background">
	<Navbar />
	<main class="flex-1">
		<PostHeader {...post} />
		<PostBody html={bodyHtml} />
		<Related posts={related} />
	</main>
	<Footer />
</div>
