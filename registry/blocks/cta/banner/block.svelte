<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div
			class="flex flex-col items-center gap-6 rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground sm:px-14"
		>
			<h2 class="max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				Ready to ship something people love?
			</h2>
			<p class="max-w-xl text-primary-foreground/80">
				Join thousands of teams building faster. Start free — no credit card required.
			</p>
			<div class="flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-background/90"
				>
					Get started
					<ArrowRight size={16} />
				</button>
				<button
					type="button"
					class="inline-flex items-center rounded-lg border border-primary-foreground/40 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
					>Book a demo</button
				>
			</div>
		</div>
	</div>
</section>
