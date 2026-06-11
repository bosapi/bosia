<script lang="ts">
	import Article from "$blocks/cards/article/block.svelte";
	import Music from "$blocks/cards/music/block.svelte";
	import Video from "$blocks/cards/video/block.svelte";
	import Gallery from "$blocks/cards/gallery/block.svelte";
</script>

<div class="flex flex-wrap items-start justify-center gap-5 p-6">
	<Article />
	<Music />
	<Video />
	<Gallery />
</div>
