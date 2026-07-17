<script lang="ts">
	type Post = {
		slug: string;
		title: string;
		tag: string;
		date: string;
		datetime: string;
	};

	let {
		heading = "Keep reading",
		base = "/blog",
		posts = [
			{
				slug: "boring-stack-fast-team",
				title: "A boring stack makes a fast team",
				tag: "Engineering",
				date: "28 April 2026",
				datetime: "2026-04-28",
			},
			{
				slug: "pricing-page-rewrite",
				title: "What rewriting our pricing page taught us",
				tag: "Growth",
				date: "9 April 2026",
				datetime: "2026-04-09",
			},
			{
				slug: "support-is-research",
				title: "Support tickets are user research",
				tag: "Product",
				date: "21 March 2026",
				datetime: "2026-03-21",
			},
		] as Post[],
	}: {
		heading?: string;
		base?: string;
		posts?: Post[];
	} = $props();
</script>

{#if posts.length}
	<section class="w-full bg-background">
		<div class="mx-auto w-full max-w-6xl border-t border-border px-6 py-16 sm:py-20">
			<h2 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h2>
			<div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each posts as post (post.slug)}
					<a
						href="{base}/{post.slug}"
						class="group rounded-2xl border border-border bg-card p-6 text-card-foreground transition hover:border-primary/40"
					>
						<div class="flex items-center gap-3 text-xs font-semibold">
							<span
								class="rounded-full bg-primary/10 px-3 py-1 uppercase tracking-wide text-primary"
								>{post.tag}</span
							>
							<time datetime={post.datetime} class="text-muted-foreground">{post.date}</time>
						</div>
						<h3
							class="mt-4 font-display text-lg font-bold tracking-tight transition group-hover:text-primary"
						>
							{post.title}
						</h3>
						<span class="mt-3 inline-block text-sm font-semibold text-primary">Read post →</span>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}
