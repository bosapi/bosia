<script lang="ts">
	import Block from "$blocks/cards/feature-editorial/block.svelte";
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
	/>
</svelte:head>

<!--
  Scoped editorial-theme token overrides. Override the compiled
  --color-* tokens directly (Tailwind v4 inlines hsl(var(--card))
  at build, so overriding the intermediate --card alone doesn't
  reach `bg-card`).
-->
<div class="editorial-demo p-8">
	<div class="mx-auto w-full max-w-md">
		<Block />
	</div>
</div>

<style>
	.editorial-demo {
		--color-background: hsl(40 30% 88%);
		--color-foreground: hsl(25 25% 14%);
		--color-card: hsl(40 30% 88%);
		--color-card-foreground: hsl(25 25% 14%);
		--color-muted-foreground: hsl(25 12% 42%);
		--color-accent: hsl(14 60% 56%);
		--color-accent-foreground: hsl(40 38% 94%);
		--font-display: "Instrument Serif", "Times New Roman", serif;
		background-color: hsl(40 30% 88%);
		border-radius: 1rem;
	}
</style>
