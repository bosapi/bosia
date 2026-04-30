<script lang="ts">
	import { Button } from "$registry/button";

	let clicked = $state("");
</script>

<div class="flex flex-col gap-4 w-full">
	<div class="flex flex-wrap items-center gap-3">
		<Button onclick={() => (clicked = "default")}>Default</Button>
		<Button variant="destructive" onclick={() => (clicked = "destructive")}>Destructive</Button>
		<Button variant="outline" onclick={() => (clicked = "outline")}>Outline</Button>
		<Button variant="secondary" onclick={() => (clicked = "secondary")}>Secondary</Button>
		<Button variant="ghost" onclick={() => (clicked = "ghost")}>Ghost</Button>
		<Button variant="link" onclick={() => (clicked = "link")}>Link</Button>
	</div>
	<div class="flex flex-wrap items-center gap-3">
		<Button size="sm">Small</Button>
		<Button>Default</Button>
		<Button size="lg">Large</Button>
		<Button size="icon">★</Button>
	</div>
	{#if clicked}
		<p class="text-sm text-muted-foreground">Clicked: <strong>{clicked}</strong></p>
	{/if}
</div>
