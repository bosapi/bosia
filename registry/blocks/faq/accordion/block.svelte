<script lang="ts">
	import { Plus } from "@lucide/svelte";

	const faqs = [
		{
			q: "Can I change plans later?",
			a: "Yes — upgrade, downgrade or cancel at any time. Changes are prorated to the day.",
		},
		{
			q: "Do you offer a free trial?",
			a: "Every paid plan starts with a 14-day trial. No credit card required to get going.",
		},
		{
			q: "How does billing work?",
			a: "We bill per seat, monthly or annually. Annual plans save 15% versus paying monthly.",
		},
		{
			q: "Is my data secure?",
			a: "All data is encrypted in transit and at rest. Enterprise plans add SSO, audit logs and an SLA.",
		},
		{
			q: "Can I get a refund?",
			a: "If you're not happy in the first 30 days, contact us and we'll refund you in full.",
		},
	];
</script>

<section class="w-full bg-background">
	<div class="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[1fr_1.4fr]">
		<div class="lg:sticky lg:top-24 lg:self-start">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">FAQ</span>
			<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				Frequently asked questions
			</h2>
			<div class="mt-6 rounded-2xl border border-border bg-card p-6 text-card-foreground">
				<p class="text-sm font-semibold">Still have questions?</p>
				<p class="mt-1 text-sm text-muted-foreground">
					Our team is here to help. We usually reply within a few hours.
				</p>
				<button
					type="button"
					class="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
					>Contact support</button
				>
			</div>
		</div>

		<div class="divide-y divide-border border-t border-border">
			{#each faqs as faq (faq.q)}
				<details class="group">
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium [&::-webkit-details-marker]:hidden"
					>
						{faq.q}
						<Plus
							size={18}
							class="flex-none text-muted-foreground transition-transform group-open:rotate-45"
						/>
					</summary>
					<p class="pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
				</details>
			{/each}
		</div>
	</div>
</section>
