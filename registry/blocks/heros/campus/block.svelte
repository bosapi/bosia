<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";

	const links = ["Programs", "Admissions", "Campus life", "Research"];
	const stats = [
		{ value: "120+", label: "Degree programs" },
		{ value: "1:9", label: "Faculty ratio" },
		{ value: "94%", label: "Employed in a year" },
	];
</script>

<section
	class="relative w-full overflow-hidden bg-foreground text-background"
	style="min-height:88vh"
>
	<!-- Photo + scrim -->
	<img
		src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&q=80"
		alt=""
		loading="lazy"
		class="absolute inset-0 h-full w-full object-cover"
	/>
	<div
		class="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/90"
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
				>Apply</button
			>
		</header>

		<!-- Content -->
		<div
			class="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 pb-20 text-center"
		>
			<div
				class="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-background/70"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-primary"></span> Fall admissions now open
			</div>
			<h1 class="font-display text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
				Where curiosity becomes a career.
			</h1>
			<p class="mt-5 max-w-xl text-lg text-background/80">
				Join 40,000 students across 120 programs at a university built for the work the world needs
				next.
			</p>
			<div class="mt-8 flex flex-wrap justify-center gap-3.5">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					Start your application <ArrowRight size={19} />
				</button>
				<button
					type="button"
					class="rounded-lg border border-background/30 px-6 py-3 text-base font-semibold text-background hover:bg-background/10"
				>
					Book a campus tour
				</button>
			</div>
			<div class="mt-12 flex flex-wrap justify-center gap-14">
				{#each stats as stat (stat.label)}
					<div>
						<div class="font-display text-3xl font-extrabold">{stat.value}</div>
						<div class="mt-1 text-sm text-background/70">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
