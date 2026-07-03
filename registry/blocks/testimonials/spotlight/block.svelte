<script lang="ts">
	import { Quote } from "@lucide/svelte";
</script>

<section class="w-full bg-muted/40">
	<div class="mx-auto w-full max-w-4xl px-6 py-16 text-center sm:py-24">
		<Quote size={40} class="mx-auto text-primary" />
		<blockquote
			class="mx-auto mt-6 max-w-3xl font-display text-2xl font-medium leading-snug tracking-tight text-foreground sm:text-3xl"
		>
			“This is the first tool where design and engineering finally speak the same language. We moved
			twice as fast and the product has never looked better.”
		</blockquote>

		<figcaption class="mt-8 flex items-center justify-center gap-3">
			<span
				class="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-primary/15 font-display text-base font-bold text-primary"
				>PS</span
			>
			<span class="text-left">
				<span class="block font-bold">Priya Shah</span>
				<span class="block text-sm text-muted-foreground">Head of Design, Northwind</span>
			</span>
		</figcaption>

		<div class="mt-8 flex justify-center gap-2" aria-hidden="true">
			<span class="h-2 w-6 rounded-full bg-primary"></span>
			<span class="h-2 w-2 rounded-full bg-border"></span>
			<span class="h-2 w-2 rounded-full bg-border"></span>
		</div>
	</div>
</section>
