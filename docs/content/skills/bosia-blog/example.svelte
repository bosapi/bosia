<script lang="ts">
	import { Card, CardContent } from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import { Separator } from "$lib/components/ui/separator";

	let {
		data,
	}: {
		data: {
			posts: Array<{
				slug: string;
				title: string;
				excerpt: string;
				date: string;
				tag: string;
			}>;
		};
	} = $props();
</script>

<main class="mx-auto max-w-3xl px-6 py-16 text-foreground">
	<header class="mb-12">
		<h1 class="text-5xl font-semibold tracking-tight">Field Notes</h1>
		<p class="mt-3 text-muted-foreground">Writing on registry-first UI and Svelte 5.</p>
	</header>

	<Separator class="mb-8" />

	<ul class="space-y-8">
		{#each data.posts as post (post.slug)}
			<li>
				<a href={`/blog/${post.slug}`} class="block">
					<Card class="border-border bg-card transition-colors hover:bg-accent">
						<CardContent class="space-y-3 p-6">
							<div class="flex items-center gap-3 text-sm text-muted-foreground">
								<time datetime={post.date}
									>{new Date(post.date).toLocaleDateString("en-GB", {
										day: "numeric",
										month: "long",
										year: "numeric",
									})}</time
								>
								<Badge variant="secondary">{post.tag}</Badge>
							</div>
							<h2 class="text-2xl font-semibold tracking-tight text-card-foreground">
								{post.title}
							</h2>
							<p class="text-muted-foreground">{post.excerpt}</p>
						</CardContent>
					</Card>
				</a>
			</li>
		{/each}
	</ul>
</main>
