<script lang="ts">
	import { Truck } from "@lucide/svelte";

	interface Props {
		text?: string;
		cta?: string;
	}

	let { text = "Free, carbon-neutral delivery on orders over $50", cta = "Start shopping" }: Props =
		$props();
</script>

<section class="bg-background py-4">
	<div class="mx-auto w-full max-w-6xl px-6">
		<div
			class="flex flex-wrap items-center justify-between gap-6 rounded-xl bg-foreground px-6 py-5 text-background sm:px-10"
		>
			<div class="flex items-center gap-3.5">
				<Truck size={26} strokeWidth={1.6} />
				<span class="font-display text-[22px]">{text}</span>
			</div>
			{#if cta}
				<button
					type="button"
					class="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-[15px] font-semibold text-primary-foreground transition hover:brightness-110"
					>{cta}</button
				>
			{/if}
		</div>
	</div>
</section>
