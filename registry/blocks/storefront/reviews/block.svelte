<script lang="ts">
	import { BadgeCheck, Star } from "@lucide/svelte";

	export interface Review {
		author: string;
		rating: number;
		date: string;
		title?: string;
		body: string;
		verified?: boolean;
	}

	interface Props {
		title?: string;
		rating?: number;
		count?: number;
		/** Percentage per star, 5 stars first. Derived from reviews when omitted. */
		distribution?: number[];
		reviews?: Review[];
		onSubmit?: (review: Review) => void;
	}

	const SAMPLE_REVIEWS: Review[] = [
		{
			author: "Maya Lindqvist",
			rating: 5,
			date: "2 weeks ago",
			title: "Even better in person",
			body: "The glaze has a soft speckle you don't see in the photos. Survives the dishwasher and still looks hand-thrown. Ordering the matching bowls next.",
			verified: true,
		},
		{
			author: "Tomas Reyes",
			rating: 5,
			date: "1 month ago",
			title: "Solid weight, no wobble",
			body: "Sits flat, pours clean, and the handle actually fits a full hand. You can tell someone trimmed the foot properly.",
			verified: true,
		},
		{
			author: "Priya Nair",
			rating: 4,
			date: "1 month ago",
			title: "Lovely, runs slightly small",
			body: "Beautiful finish and the colour matches the listing. Just note the capacity is closer to 300ml than the 350ml I expected.",
			verified: true,
		},
		{
			author: "Jonas Weber",
			rating: 5,
			date: "2 months ago",
			body: "Bought two as a gift and kept one for myself. Packaging was plastic-free and everything arrived without a chip.",
		},
		{
			author: "Elif Kaya",
			rating: 3,
			date: "3 months ago",
			title: "Good, but slow to arrive",
			body: "The piece itself is great — small-batch quality is obvious. Shipping took twelve days though, so plan ahead if it's a present.",
			verified: true,
		},
	];

	let { title = "Reviews", rating, count, distribution, reviews, onSubmit }: Props = $props();

	// Reviews submitted locally, newest first, ahead of the seeded list.
	let submitted = $state<Review[]>([]);
	const all = $derived([...submitted, ...(reviews ?? SAMPLE_REVIEWS)]);

	const avg = $derived(all.length ? all.reduce((sum, r) => sum + r.rating, 0) / all.length : 0);
	const shownRating = $derived(rating ?? Math.round(avg * 10) / 10);
	const shownCount = $derived(count ?? all.length);
	const bars = $derived(
		distribution ??
			[5, 4, 3, 2, 1].map((star) =>
				all.length
					? Math.round((all.filter((r) => r.rating === star).length / all.length) * 100)
					: 0,
			),
	);

	// Write-a-review form (local only; fires onSubmit for real wiring).
	let formOpen = $state(false);
	let formName = $state("");
	let formRating = $state(5);
	let formTitle = $state("");
	let formBody = $state("");

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!formName.trim() || !formBody.trim()) return;
		const review: Review = {
			author: formName.trim(),
			rating: formRating,
			date: "Just now",
			title: formTitle.trim() || undefined,
			body: formBody.trim(),
		};
		submitted = [review, ...submitted];
		onSubmit?.(review);
		formOpen = false;
		formName = "";
		formRating = 5;
		formTitle = "";
		formBody = "";
	}

	function initials(name: string) {
		return name
			.split(" ")
			.map((part) => part[0])
			.slice(0, 2)
			.join("")
			.toUpperCase();
	}
</script>

{#snippet stars(value: number, size = 14)}
	<span class="inline-flex gap-0.5">
		{#each Array(5) as _, i (i)}
			<Star
				{size}
				class={i < Math.round(value)
					? "fill-amber-500 text-amber-500"
					: "fill-muted text-muted-foreground/40"}
			/>
		{/each}
	</span>
{/snippet}

<section class="w-full" aria-label={title}>
	<h2 class="mb-6 font-display text-2xl tracking-tight sm:text-3xl">{title}</h2>

	<div class="grid items-start gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
		<!-- Summary -->
		<div class="flex flex-col gap-5 lg:sticky lg:top-24">
			<div class="flex items-end gap-3">
				<span class="font-display text-5xl leading-none tracking-tight tabular-nums"
					>{shownRating.toFixed(1)}</span
				>
				<div class="flex flex-col gap-1 pb-0.5">
					{@render stars(shownRating)}
					<span class="text-[13px] text-muted-foreground">{shownCount} reviews</span>
				</div>
			</div>

			<div class="flex flex-col gap-1.5" aria-hidden="true">
				{#each bars as pct, i (i)}
					<div class="flex items-center gap-2.5 text-[13px] text-muted-foreground">
						<span class="w-6 text-right tabular-nums">{5 - i}★</span>
						<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
							<div class="h-full rounded-full bg-amber-500" style="width: {pct}%"></div>
						</div>
						<span class="w-8 tabular-nums">{pct}%</span>
					</div>
				{/each}
			</div>

			<button
				type="button"
				onclick={() => (formOpen = !formOpen)}
				class="inline-flex w-fit items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-semibold transition hover:bg-muted"
			>
				{formOpen ? "Cancel" : "Write a review"}
			</button>
		</div>

		<!-- Form + list -->
		<div class="flex flex-col">
			{#if formOpen}
				<form
					onsubmit={submit}
					class="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
				>
					<div class="flex items-center gap-3">
						<span class="text-sm font-medium">Your rating</span>
						<span class="inline-flex gap-0.5">
							{#each Array(5) as _, i (i)}
								<button
									type="button"
									aria-label="{i + 1} stars"
									onclick={() => (formRating = i + 1)}
									class="transition hover:scale-110"
								>
									<Star
										size={20}
										class={i < formRating
											? "fill-amber-500 text-amber-500"
											: "fill-muted text-muted-foreground/40"}
									/>
								</button>
							{/each}
						</span>
					</div>
					<div class="grid gap-4 sm:grid-cols-2">
						<label class="flex flex-col gap-1.5 text-sm font-medium">
							Name
							<input
								bind:value={formName}
								required
								placeholder="Your name"
								class="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none transition focus:border-primary"
							/>
						</label>
						<label class="flex flex-col gap-1.5 text-sm font-medium">
							Title <span class="font-normal text-muted-foreground/70">(optional)</span>
							<input
								bind:value={formTitle}
								placeholder="Sum it up"
								class="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none transition focus:border-primary"
							/>
						</label>
					</div>
					<label class="flex flex-col gap-1.5 text-sm font-medium">
						Review
						<textarea
							bind:value={formBody}
							required
							rows={4}
							placeholder="What did you like or dislike?"
							class="resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none transition focus:border-primary"
						></textarea>
					</label>
					<button
						type="submit"
						class="inline-flex w-fit items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-[13px] font-semibold text-background transition hover:brightness-110"
					>
						Submit review
					</button>
				</form>
			{/if}

			<ul class="flex flex-col divide-y divide-border">
				{#each all as review (review.author + review.date)}
					<li class="flex flex-col gap-2.5 py-6 first:pt-0 last:pb-0">
						<div class="flex items-center gap-3">
							<span
								class="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
							>
								{initials(review.author)}
							</span>
							<div class="flex-1">
								<div class="text-sm font-semibold">{review.author}</div>
								<div class="text-xs text-muted-foreground/70">{review.date}</div>
							</div>
							{#if review.verified}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-emerald-600 dark:text-emerald-400"
								>
									<BadgeCheck size={12} /> Verified
								</span>
							{/if}
						</div>
						{@render stars(review.rating)}
						{#if review.title}
							<span class="text-sm font-semibold">{review.title}</span>
						{/if}
						<p class="text-[13.5px] leading-relaxed text-muted-foreground">{review.body}</p>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
