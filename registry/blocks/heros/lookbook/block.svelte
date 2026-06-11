<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";

	const links = ["New in", "Clothing", "Accessories", "Editorial"];
</script>

<section
	class="relative w-full overflow-hidden bg-foreground text-background"
	style="min-height:88vh"
>
	<!-- Photo + scrim -->
	<img
		src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80"
		alt=""
		loading="lazy"
		class="absolute inset-0 h-full w-full object-cover object-[center_25%]"
	/>
	<div
		class="absolute inset-0 bg-gradient-to-b from-foreground/50 via-transparent to-foreground/85"
	></div>

	<div class="relative z-10 flex min-h-[88vh] flex-col">
		<!-- Nav -->
		<header class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
			<div class="flex items-center gap-2.5">
				<div
					class="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
				>
					B
				</div>
				<span class="font-display text-lg font-extrabold tracking-tight">Brand</span>
			</div>
			<nav class="hidden items-center gap-7 md:flex">
				{#each links as link (link)}
					<button type="button" class="text-sm font-medium text-background/80 hover:text-background"
						>{link}</button
					>
				{/each}
			</nav>
			<button
				type="button"
				class="rounded-lg border border-background/30 px-4 py-2 text-sm font-semibold text-background hover:bg-background/10"
				>Bag (0)</button
			>
		</header>

		<!-- Content -->
		<div class="mx-auto flex w-full max-w-6xl flex-1 items-end px-6 pb-16">
			<div class="flex w-full flex-wrap items-end justify-between gap-10">
				<div>
					<div
						class="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-background"
					>
						<span class="h-px w-8 bg-background/60"></span> Autumn / Winter ’26
					</div>
					<h1 class="font-display text-6xl font-bold leading-[0.9] tracking-tight sm:text-8xl">
						Quiet<br />luxury.
					</h1>
					<p class="mt-6 max-w-md text-lg text-background/80">
						Considered cuts in natural cloth. The new season, photographed in available light.
					</p>
				</div>
				<div class="flex flex-wrap gap-3">
					<button
						type="button"
						class="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-base font-semibold text-foreground transition hover:brightness-95"
					>
						Shop the collection <ArrowRight size={19} />
					</button>
					<button
						type="button"
						class="rounded-lg border border-background/30 px-6 py-3 text-base font-semibold text-background hover:bg-background/10"
					>
						View lookbook
					</button>
				</div>
			</div>
		</div>
	</div>
</section>
