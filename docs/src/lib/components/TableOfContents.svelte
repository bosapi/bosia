<script lang="ts">
	let {
		headings,
	}: {
		headings: { id: string; text: string; level: number }[];
	} = $props();
</script>

{#if headings.length > 0}
	<nav class="text-sm">
		<h4 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
			On this page
		</h4>
		<ul class="flex flex-col gap-1.5">
			{#each headings as heading}
				<li style="padding-left: {(heading.level - 2) * 0.75}rem">
					<a
						href="#{heading.id}"
						class="block text-muted-foreground transition-colors hover:text-foreground"
					>
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
