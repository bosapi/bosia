<script lang="ts">
	import { Star } from "@lucide/svelte";

	const testimonials = [
		{
			quote:
				"We shipped a full redesign in a week. The token system meant every screen just fell into place.",
			name: "Priya Shah",
			role: "Head of Design, Northwind",
			initials: "PS",
		},
		{
			quote:
				"Support is unreal. Every question answered within minutes, and always by someone who gets it.",
			name: "Marcus Lee",
			role: "CTO, Fathom",
			initials: "ML",
		},
		{
			quote: "Onboarding took an afternoon. Our whole team was productive by the end of day one.",
			name: "Elena Ruiz",
			role: "PM, Lumen",
			initials: "ER",
		},
		{
			quote: "The analytics alone paid for the plan. We finally see what our users actually do.",
			name: "Tom Becker",
			role: "Founder, Drift",
			initials: "TB",
		},
		{
			quote: "It scales with us. We started on the free tier and never had to rethink our setup.",
			name: "Aisha Khan",
			role: "Eng Lead, Vela",
			initials: "AK",
		},
		{
			quote:
				"Beautiful defaults, endless flexibility. It's the rare tool designers and devs both love.",
			name: "Jonas Weber",
			role: "Design Eng, Kite",
			initials: "JW",
		},
	];
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div class="mx-auto max-w-2xl text-center">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary"
				>Testimonials</span
			>
			<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				Loved by teams everywhere
			</h2>
		</div>

		<div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each testimonials as t (t.name)}
				<figure
					class="flex flex-col rounded-2xl border border-border bg-card p-6 text-card-foreground"
				>
					<div class="flex gap-0.5 text-amber-500">
						{#each [0, 1, 2, 3, 4] as i (i)}
							<Star size={15} class="fill-amber-500" />
						{/each}
					</div>
					<blockquote class="mt-4 flex-1 text-sm leading-relaxed text-foreground">
						“{t.quote}”
					</blockquote>
					<figcaption class="mt-6 flex items-center gap-3">
						<span
							class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary"
							>{t.initials}</span
						>
						<span>
							<span class="block text-sm font-bold">{t.name}</span>
							<span class="block text-xs text-muted-foreground">{t.role}</span>
						</span>
					</figcaption>
				</figure>
			{/each}
		</div>
	</div>
</section>
