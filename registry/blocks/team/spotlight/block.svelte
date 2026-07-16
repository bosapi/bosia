<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div
			class="grid items-center gap-10 rounded-3xl border border-border bg-card p-8 text-card-foreground sm:p-12 lg:grid-cols-[auto_1fr] lg:gap-14"
		>
			<img
				src="https://i.pravatar.cc/400?img=12"
				alt="Jeki Maulana"
				class="mx-auto h-48 w-48 rounded-2xl object-cover lg:h-64 lg:w-64"
				loading="lazy"
			/>
			<div class="max-w-xl">
				<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Founder</span>
				<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
					Jeki Maulana
				</h2>
				<p class="mt-1 text-sm font-semibold text-muted-foreground">Founder & CEO</p>
				<blockquote class="mt-6 text-lg leading-relaxed">
					“We started this company because small teams deserve tools that feel like they were built
					just for them. Every decision we make starts with that.”
				</blockquote>
				<p class="mt-4 text-sm text-muted-foreground">
					Previously led product at two startups; now spends most days talking to customers and
					shipping alongside the team.
				</p>
				<a
					href="#story"
					class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
				>
					Read our story <ArrowRight size={16} />
				</a>
			</div>
		</div>
	</div>
</section>
