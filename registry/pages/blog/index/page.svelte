<script lang="ts">
	import Navbar from "$lib/blocks/navbars/minimal/block.svelte";
	import PostList from "$lib/blocks/blog/post-list/block.svelte";
	import Footer from "$lib/blocks/footers/minimal/block.svelte";

	type Post = {
		slug: string;
		title: string;
		excerpt: string;
		tag: string;
		date: string;
		datetime: string;
	};

	// posts is optional — the block ships sample posts; feed it from a server loader when ready
	let { posts }: { posts?: Post[] } = $props();
</script>

<div class="flex min-h-screen flex-col bg-background">
	<Navbar />
	<main class="flex-1">
		<PostList {posts} />
	</main>
	<Footer />
</div>
