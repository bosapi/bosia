<script lang="ts">
	import { Star } from "@lucide/svelte";

	interface Review {
		quote: string;
		name: string;
		meta: string;
		rating: number;
	}
	interface Props {
		eyebrow?: string;
		title?: string;
		reviews?: Review[];
	}

	let {
		eyebrow = "Loved by customers",
		title = "What people tell us",
		reviews = [
			{
				quote:
					"Genuinely the nicest online shopping experience I've had this year. Everything arrived perfectly.",
				name: "Maya R.",
				meta: "Verified buyer",
				rating: 5,
			},
			{
				quote:
					"Quality is a step above what I expected for the price. I've already ordered twice more.",
				name: "Daniel K.",
				meta: "Verified buyer",
				rating: 5,
			},
			{
				quote:
					"Fast delivery, beautiful packaging, and the product is exactly as described. No notes.",
				name: "Priya S.",
				meta: "Verified buyer",
				rating: 4,
			},
		],
	}: Props = $props();
</script>

<section class="bg-background py-16 sm:py-20 lg:py-24">
	<div class="mx-auto w-full max-w-6xl px-6">
		{#if eyebrow || title}
			<div class="mb-8 sm:mb-10">
				{#if eyebrow}
					<span class="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-primary"
						>{eyebrow}</span
					>
				{/if}
				{#if title}<h2 class="font-display text-3xl tracking-tight sm:text-4xl">{title}</h2>{/if}
			</div>
		{/if}

		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each reviews as review (review.name)}
				<figure
					class="flex flex-col gap-4 rounded-xl border border-border bg-card p-7 text-card-foreground"
				>
					<div class="flex">
						{#each Array(5) as _, i (i)}
							<Star
								size={16}
								class={i < review.rating
									? "fill-amber-500 text-amber-500"
									: "fill-muted text-muted-foreground/40"}
							/>
						{/each}
					</div>
					<blockquote class="font-display text-xl leading-snug tracking-tight">
						“{review.quote}”
					</blockquote>
					<figcaption class="mt-auto flex items-center gap-3">
						<span
							class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/10 text-[15px] font-bold text-primary"
							>{review.name.charAt(0)}</span
						>
						<span>
							<span class="block text-[15px] font-semibold">{review.name}</span>
							<span class="block text-sm text-muted-foreground/70">{review.meta}</span>
						</span>
					</figcaption>
				</figure>
			{/each}
		</div>
	</div>
</section>
