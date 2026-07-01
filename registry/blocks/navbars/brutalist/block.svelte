<script lang="ts">
	const links = ["Browse", "Layouts", "Themes"];
</script>

<header
	class="flex w-full items-center justify-between border-b-[3px] border-foreground bg-primary px-6 text-primary-foreground"
	style="height:70px"
>
	<div class="flex items-center gap-3">
		<span class="grid h-8 w-8 place-items-center bg-foreground">
			<span class="h-2.5 w-2.5 rounded-full bg-primary"></span>
		</span>
		<span class="font-display text-xl font-bold uppercase tracking-tight">__BRAND__</span>
	</div>

	<div class="flex items-center gap-6">
		<nav class="hidden items-center gap-6 sm:flex">
			{#each links as link (link)}
				<a href="/" class="font-mono text-sm font-bold uppercase tracking-wide">{link}</a>
			{/each}
		</nav>
		<button
			type="button"
			class="bg-foreground px-4 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-background shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
			>Copy →</button
		>
	</div>
</header>
