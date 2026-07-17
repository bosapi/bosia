<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		TypographyH2,
		TypographyP,
		TypographyBlockquote,
		TypographyList,
	} from "$lib/components/ui/typography";

	let {
		html,
		children,
	}: {
		html?: string;
		children?: Snippet;
	} = $props();

	// prose styles for raw HTML (e.g. a post body from the database) — mirrors ui/typography
	const prose =
		"leading-7 [&_h2]:mt-10 [&_h2]:scroll-m-20 [&_h2]:border-b [&_h2]:pb-2 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight " +
		"[&_h3]:mt-8 [&_h3]:scroll-m-20 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:tracking-tight " +
		"[&_p]:mt-6 [&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:pl-6 [&_blockquote]:italic " +
		"[&_ul]:my-6 [&_ul]:ml-6 [&_ul]:list-disc [&_li]:mt-2 " +
		"[&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_img]:my-8 [&_img]:rounded-2xl";
</script>

<section class="w-full bg-background">
	<article class="mx-auto w-full max-w-[70ch] px-6 py-12 sm:py-16">
		{#if html}
			<div class={prose}>
				<!-- html is rendered unescaped — only pass trusted content (your own DB), never user input -->
				{@html html}
			</div>
		{:else if children}
			{@render children()}
		{:else}
			<TypographyP>
				The fastest way to learn what a feature is worth is to put it in front of people who didn't
				build it. Polish delays that lesson; shipping collects it.
			</TypographyP>
			<TypographyH2 class="mt-10 font-display">Rough edges are feedback magnets</TypographyH2>
			<TypographyP>
				Users forgive an honest rough edge far more readily than a missing capability. What they
				won't do is imagine the feature you kept on a branch.
			</TypographyP>
			<TypographyBlockquote>
				A released rough edge teaches you more than an unreleased perfect one.
			</TypographyBlockquote>
			<TypographyH2 class="mt-10 font-display">What we do instead</TypographyH2>
			<TypographyList>
				<li>Ship the smallest slice that answers a real question.</li>
				<li>Watch how it's used for a week before touching it again.</li>
				<li>Polish only the paths people actually walk.</li>
			</TypographyList>
			<TypographyP>
				None of this is an argument against quality. It's an argument about sequence: quality earns
				its keep after usefulness is proven, not before.
			</TypographyP>
		{/if}
	</article>
</section>
