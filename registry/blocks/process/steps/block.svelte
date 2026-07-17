<script lang="ts">
	type Step = {
		title: string;
		description: string;
	};

	let {
		heading = "How it works",
		intro = "From first call to launch day, the same four steps every time.",
		steps = [
			{
				title: "Discover",
				description: "A short call to understand the goal, the audience and what done looks like.",
			},
			{
				title: "Design",
				description: "Wireframes first, then a polished design you can click through and react to.",
			},
			{
				title: "Build",
				description: "Weekly releases you can try in the browser — no big reveal at the end.",
			},
			{
				title: "Launch",
				description: "We ship it, watch the first real users and fix what they trip over.",
			},
		] as Step[],
	}: {
		heading?: string;
		intro?: string;
		steps?: Step[];
	} = $props();
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{heading}</h2>
			<p class="mt-4 text-muted-foreground">{intro}</p>
		</div>

		<ol class="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
			{#each steps as step, i (step.title)}
				<li class="relative flex flex-col items-start">
					<span
						class="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground"
					>
						{i + 1}
					</span>
					{#if i < steps.length - 1}
						<span
							class="absolute left-14 top-5 hidden h-px w-[calc(100%-4rem)] bg-border lg:block"
							aria-hidden="true"
						></span>
					{/if}
					<h3 class="mt-5 font-display text-lg font-bold tracking-tight">{step.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
				</li>
			{/each}
		</ol>
	</div>
</section>
