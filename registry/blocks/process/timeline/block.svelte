<script lang="ts">
	type Entry = {
		label: string;
		title: string;
		description: string;
	};

	let {
		heading = "Our story",
		intro = "The milestones that got us from a side project to a real company.",
		entries = [
			{
				label: "2022",
				title: "The side project",
				description:
					"Two of us, one laptop, evenings and weekends. The first version ships to ten friends.",
			},
			{
				label: "2023",
				title: "First paying customers",
				description:
					"Word of mouth brings the first hundred accounts — enough to quit the day jobs.",
			},
			{
				label: "2024",
				title: "The team grows",
				description: "Design, support and engineering hires turn a duo into a team of eight.",
			},
			{
				label: "2025",
				title: "Going international",
				description:
					"Half of new signups now come from outside the country. We localise everything.",
			},
			{
				label: "Today",
				title: "Just getting started",
				description: "Thousands of teams rely on us daily. The roadmap is longer than ever.",
			},
		] as Entry[],
	}: {
		heading?: string;
		intro?: string;
		entries?: Entry[];
	} = $props();
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
		<h2 class="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{heading}</h2>
		<p class="mt-4 max-w-xl text-muted-foreground">{intro}</p>

		<ol class="mt-14 border-l border-border">
			{#each entries as entry (entry.title)}
				<li class="relative pb-12 pl-8 last:pb-0">
					<span
						class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary"
						aria-hidden="true"
					></span>
					<span class="text-xs font-semibold uppercase tracking-wide text-primary"
						>{entry.label}</span
					>
					<h3 class="mt-1 font-display text-lg font-bold tracking-tight">{entry.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
				</li>
			{/each}
		</ol>
	</div>
</section>
