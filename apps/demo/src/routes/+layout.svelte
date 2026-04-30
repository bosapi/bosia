<script lang="ts">
	import "../app.css";
	let { children }: { children: any } = $props();
</script>

<div data-bosia-preload="hover">
	{@render children()}
</div>
