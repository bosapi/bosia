<script lang="ts">
	import { Toggle } from "$registry/toggle";

	let bold = $state(false);
</script>

<div class="flex flex-col gap-6">
	<!-- Default toggle -->
	<div class="flex items-center gap-2">
		<Toggle bind:pressed={bold} aria-label="Toggle bold">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path
					d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"
				/></svg
			>
		</Toggle>
		<span class="text-sm text-muted-foreground">
			Bold is {bold ? "on" : "off"}
		</span>
	</div>

	<!-- Outline variant -->
	<div class="flex items-center gap-2">
		<Toggle variant="outline" aria-label="Toggle italic">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line
					x1="15"
					x2="9"
					y1="4"
					y2="20"
				/></svg
			>
		</Toggle>
	</div>

	<!-- With text -->
	<div class="flex items-center gap-2">
		<Toggle aria-label="Toggle italic">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line
					x1="15"
					x2="9"
					y1="4"
					y2="20"
				/></svg
			>
			Italic
		</Toggle>
	</div>

	<!-- Sizes -->
	<div class="flex items-center gap-2">
		<Toggle size="sm" aria-label="Small toggle">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path
					d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"
				/></svg
			>
		</Toggle>
		<Toggle aria-label="Default toggle">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path
					d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"
				/></svg
			>
		</Toggle>
		<Toggle size="lg" aria-label="Large toggle">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path
					d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"
				/></svg
			>
		</Toggle>
	</div>

	<!-- Disabled -->
	<div class="flex items-center gap-2">
		<Toggle disabled aria-label="Disabled toggle">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path
					d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"
				/></svg
			>
		</Toggle>
		<span class="text-sm text-muted-foreground">Disabled</span>
	</div>
</div>
