<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";

	interface Props {
		eyebrow?: string;
		title?: string;
		body?: string;
		cta?: string;
		image?: string;
		/** Place the image on the right instead of the left. */
		flip?: boolean;
	}

	let {
		eyebrow = "Our story",
		title = "Made to last, not to land in a bin",
		body = "We work with a small group of makers and growers we know by name. Everything we sell is chosen to be used, repaired and kept — not replaced.",
		cta = "Meet our makers",
		image = "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80",
		flip = false,
	}: Props = $props();
</script>

<section class="bg-background py-16 sm:py-20 lg:py-24">
	<div class="mx-auto grid w-full max-w-6xl items-center gap-8 px-6 lg:grid-cols-2 lg:gap-16">
		<div class="overflow-hidden rounded-xl {flip ? 'lg:order-2' : ''}">
			<img src={image} alt="" loading="lazy" class="aspect-[5/6] h-full w-full object-cover" />
		</div>
		<div class="flex flex-col items-start gap-4">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</span>
			<h2 class="font-display text-3xl tracking-tight sm:text-4xl">{title}</h2>
			<p class="text-lg text-muted-foreground">{body}</p>
			<button
				type="button"
				class="mt-2 inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-3 text-[15px] font-semibold text-background transition hover:brightness-110"
			>
				{cta}
				<ArrowRight size={18} />
			</button>
		</div>
	</div>
</section>
