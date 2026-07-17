<script lang="ts">
	type Post = {
		slug: string;
		title: string;
		excerpt: string;
		tag: string;
		date: string;
		datetime: string;
	};

	let {
		heading = "Blog",
		intro = "Notes on building products, one honest write-up at a time.",
		base = "/blog",
		posts = [
			{
				slug: "shipping-beats-polishing",
				title: "Shipping beats polishing",
				excerpt: "Why a released rough edge teaches you more than an unreleased perfect one.",
				tag: "Product",
				date: "12 May 2026",
				datetime: "2026-05-12",
			},
			{
				slug: "boring-stack-fast-team",
				title: "A boring stack makes a fast team",
				excerpt: "We replaced four services with one database table and nobody noticed but us.",
				tag: "Engineering",
				date: "28 April 2026",
				datetime: "2026-04-28",
			},
			{
				slug: "pricing-page-rewrite",
				title: "What rewriting our pricing page taught us",
				excerpt: "Three words changed conversion more than three months of feature work.",
				tag: "Growth",
				date: "9 April 2026",
				datetime: "2026-04-09",
			},
			{
				slug: "support-is-research",
				title: "Support tickets are user research",
				excerpt: "Every reply we send doubles as an interview we didn't have to schedule.",
				tag: "Product",
				date: "21 March 2026",
				datetime: "2026-03-21",
			},
		] as Post[],
	}: {
		heading?: string;
		intro?: string;
		base?: string;
		posts?: Post[];
	} = $props();
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
		<h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{heading}</h1>
		<p class="mt-4 max-w-xl text-muted-foreground">{intro}</p>

		<div class="mt-14 flex flex-col gap-6">
			{#each posts as post (post.slug)}
				<a
					href="{base}/{post.slug}"
					class="group rounded-2xl border border-border bg-card p-6 text-card-foreground transition hover:border-primary/40 sm:p-8"
				>
					<div class="flex items-center gap-3 text-xs font-semibold">
						<span class="rounded-full bg-primary/10 px-3 py-1 uppercase tracking-wide text-primary"
							>{post.tag}</span
						>
						<time datetime={post.datetime} class="text-muted-foreground">{post.date}</time>
					</div>
					<h2
						class="mt-4 font-display text-xl font-bold tracking-tight transition group-hover:text-primary sm:text-2xl"
					>
						{post.title}
					</h2>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
					<span class="mt-4 inline-block text-sm font-semibold text-primary">Read post →</span>
				</a>
			{/each}
		</div>
	</div>
</section>
