<script lang="ts">
	import { ArrowRight, Play } from "@lucide/svelte";

	const links = ["Courses", "Paths", "For teams", "Pricing"];
	const stats = [
		{ value: "12k+", label: "Graduates", accent: false },
		{ value: "4.9", label: "Avg. rating", accent: true },
		{ value: "92%", label: "Land a role", accent: false },
	];
	const avatars = [20, 33, 51, 7, 12];
</script>

<section class="relative w-full overflow-hidden bg-background text-foreground">
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
				<button
					type="button"
					class="text-sm font-medium text-muted-foreground hover:text-foreground">{link}</button
				>
			{/each}
		</nav>
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
				>Log in</button
			>
			<button
				type="button"
				class="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
				>Start free</button
			>
		</div>
	</header>

	<!-- Content -->
	<div
		class="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-2 lg:gap-14"
	>
		<!-- Copy -->
		<div class="max-w-xl">
			<div
				class="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-primary"
			>
				<span class="h-px w-8 bg-primary/60"></span> New cohort · Starts April 8
			</div>
			<h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
				Learn to design products people <span class="text-primary">actually use</span>.
			</h1>
			<p class="mt-4 max-w-md text-lg text-muted-foreground">
				A 6-week, project-based program with live critiques, a real portfolio piece, and mentors
				from teams you admire.
			</p>
			<div class="mt-7 flex flex-wrap gap-3">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					Enroll now <ArrowRight size={19} />
				</button>
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg border border-input px-6 py-3 text-base font-semibold transition hover:bg-muted"
				>
					<Play size={17} /> Watch a lesson
				</button>
			</div>
			<div class="mt-8 flex flex-wrap items-center gap-11 border-t border-border pt-6">
				{#each stats as stat (stat.label)}
					<div>
						<div class="font-display text-2xl font-extrabold {stat.accent ? 'text-primary' : ''}">
							{stat.value}
						</div>
						<div class="mt-0.5 text-sm text-muted-foreground">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Image + progress card -->
		<div class="relative flex items-center">
			<div
				class="relative aspect-[4/5] max-h-[32rem] w-full overflow-hidden rounded-2xl bg-muted shadow-lg"
			>
				<img
					src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80"
					alt="Class"
					loading="lazy"
					class="h-full w-full object-cover"
				/>
			</div>
			<div
				class="absolute -left-2 bottom-7 min-w-[14rem] rounded-xl bg-card px-4 py-3.5 text-card-foreground shadow-lg"
			>
				<div class="mb-2 flex items-center justify-between">
					<span class="font-mono text-xs uppercase tracking-wide text-muted-foreground/70"
						>Week 3</span
					>
					<span
						class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
						>Live</span
					>
				</div>
				<div class="mb-3 font-display text-base font-bold">Prototyping &amp; user testing</div>
				<div class="flex items-center gap-2.5">
					<div class="flex -space-x-2">
						{#each avatars as n (n)}
							<img
								src="https://i.pravatar.cc/80?img={n}"
								alt=""
								loading="lazy"
								class="h-7 w-7 rounded-full border-2 border-card object-cover"
							/>
						{/each}
					</div>
					<span class="text-xs text-muted-foreground">240 learning now</span>
				</div>
			</div>
		</div>
	</div>
</section>
