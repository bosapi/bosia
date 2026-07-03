<script lang="ts">
	const faqs = [
		{
			q: "Can I change plans later?",
			a: "Yes — upgrade, downgrade or cancel anytime. Changes are prorated to the day.",
		},
		{
			q: "Do you offer a free trial?",
			a: "Every paid plan starts with a 14-day trial. No credit card required.",
		},
		{
			q: "How does billing work?",
			a: "We bill per seat, monthly or annually. Annual plans save 15%.",
		},
		{
			q: "Is my data secure?",
			a: "Data is encrypted in transit and at rest. Enterprise adds SSO and audit logs.",
		},
		{
			q: "Can I get a refund?",
			a: "Not happy in the first 30 days? Contact us for a full refund.",
		},
		{
			q: "Do you support teams?",
			a: "Invite unlimited teammates and manage roles and permissions from one place.",
		},
	];
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div class="mx-auto max-w-2xl text-center">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">FAQ</span>
			<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				Questions, answered
			</h2>
		</div>

		<div class="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2">
			{#each faqs as faq (faq.q)}
				<div class="border-t border-border pt-6">
					<h3 class="font-semibold">{faq.q}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
