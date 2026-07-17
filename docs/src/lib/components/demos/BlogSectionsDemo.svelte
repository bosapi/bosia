<script lang="ts">
	import PostList from "$blocks/blog/post-list/block.svelte";
	import PostHeader from "$blocks/blog/post-header/block.svelte";
	import PostBody from "$blocks/blog/post-body/block.svelte";
	import Related from "$blocks/blog/related/block.svelte";
</script>

<div class="max-h-[80vh] space-y-6 overflow-y-auto rounded-lg border border-border bg-muted/30 p-6">
	<PostList />
	<PostHeader />
	<PostBody />
	<Related />
</div>
