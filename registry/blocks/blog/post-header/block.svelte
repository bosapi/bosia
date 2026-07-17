<script lang="ts">
	let {
		tag = "Product",
		title = "Shipping beats polishing",
		excerpt = "Why a released rough edge teaches you more than an unreleased perfect one.",
		author = "Jeki Maulana",
		avatar = "https://i.pravatar.cc/80?img=12",
		date = "12 May 2026",
		datetime = "2026-05-12",
		readingTime = "6 min read",
		cover = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80",
		coverAlt = "Desk with an open notebook and laptop",
	}: {
		tag?: string;
		title?: string;
		excerpt?: string;
		author?: string;
		avatar?: string;
		date?: string;
		datetime?: string;
		readingTime?: string;
		cover?: string;
		coverAlt?: string;
	} = $props();
</script>

<header class="w-full bg-background">
	<div class="mx-auto w-full max-w-3xl px-6 pt-16 sm:pt-24">
		<div class="flex items-center gap-3 text-xs font-semibold">
			<span class="rounded-full bg-primary/10 px-3 py-1 uppercase tracking-wide text-primary"
				>{tag}</span
			>
			<time {datetime} class="text-muted-foreground">{date}</time>
		</div>
		<h1 class="mt-5 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
			{title}
		</h1>
		<p class="mt-5 text-lg leading-relaxed text-muted-foreground">{excerpt}</p>
		<div class="mt-8 flex items-center gap-3">
			<img src={avatar} alt={author} class="h-10 w-10 rounded-full object-cover" loading="lazy" />
			<div class="text-sm">
				<p class="font-semibold">{author}</p>
				<p class="text-muted-foreground">{readingTime}</p>
			</div>
		</div>
		{#if cover}
			<img
				src={cover}
				alt={coverAlt}
				class="mt-10 aspect-[2/1] w-full rounded-2xl border border-border object-cover"
			/>
		{/if}
	</div>
</header>
