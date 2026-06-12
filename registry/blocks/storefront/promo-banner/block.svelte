<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";

	interface Props {
		eyebrow?: string;
		title?: string;
		body?: string;
		cta?: string;
		image?: string;
	}

	let {
		eyebrow = "Members get more",
		title = "Join the list, save on your first order",
		body = "Early access to new arrivals, members-only pricing and a little something on your birthday.",
		cta = "Become a member",
		image = "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80",
	}: Props = $props();
</script>

<section class="bg-background py-8 sm:py-12">
	<div class="mx-auto w-full max-w-6xl px-6">
		<div
			class="grid items-center overflow-hidden rounded-2xl bg-primary text-primary-foreground md:grid-cols-[1.2fr_1fr]"
		>
			<div class="flex flex-col items-start gap-4 p-8 sm:p-12 lg:p-14">
				<span class="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">{eyebrow}</span>
				<h3 class="font-display text-3xl tracking-tight sm:text-4xl">{title}</h3>
				<p class="max-w-[40ch] opacity-90">{body}</p>
				<button
					type="button"
					class="mt-2 inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3.5 text-base font-semibold text-foreground transition hover:brightness-95"
				>
					{cta}
					<ArrowRight size={18} />
				</button>
			</div>
			<div class="relative min-h-[240px] self-stretch">
				<img
					src={image}
					alt=""
					loading="lazy"
					class="absolute inset-0 h-full w-full object-cover"
				/>
			</div>
		</div>
	</div>
</section>
