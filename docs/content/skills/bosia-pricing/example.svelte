<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { Separator } from "$lib/components/ui/separator";
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent,
	} from "$lib/components/ui/accordion";

	const tiers = [
		{
			name: "Free",
			price: 0,
			recommended: false,
			features: ["Up to 3 projects", "Community support", "Public registry"],
		},
		{
			name: "Pro",
			price: 19,
			recommended: true,
			features: [
				"Unlimited projects",
				"Private themes",
				"Priority support",
				"Custom domains",
			],
		},
		{
			name: "Team",
			price: 49,
			recommended: false,
			features: ["Everything in Pro", "5 seats included", "SSO", "Audit log"],
		},
	];
</script>

<main class="mx-auto max-w-6xl px-6 py-16 text-foreground">
	<header class="mb-12 text-center">
		<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Simple, fair pricing</h1>
		<p class="mt-3 text-muted-foreground">Start free. Upgrade when you ship.</p>
	</header>

	<section class="grid gap-6 md:grid-cols-3">
		{#each tiers as tier}
			<Card class={tier.recommended ? "border-primary shadow-md" : "border-border"}>
				<CardHeader class="space-y-2">
					<div class="flex items-center justify-between">
						<CardTitle class="text-xl">{tier.name}</CardTitle>
						{#if tier.recommended}<Badge>Recommended</Badge>{/if}
					</div>
					<div class="flex items-baseline gap-1">
						<span class="text-4xl font-semibold">${tier.price}</span>
						<span class="text-sm text-muted-foreground">/mo</span>
					</div>
				</CardHeader>
				<CardContent>
					<ul class="space-y-2 text-sm">
						{#each tier.features as f}
							<li class="flex items-start gap-2">
								<span class="mt-0.5 text-primary">✓</span>
								<span>{f}</span>
							</li>
						{/each}
					</ul>
				</CardContent>
				<CardFooter>
					<Button class="w-full" variant={tier.recommended ? "default" : "outline"}
						>Get started</Button
					>
				</CardFooter>
			</Card>
		{/each}
	</section>

	<Separator class="my-16" />

	<section>
		<h2 class="mb-8 text-2xl font-semibold tracking-tight">Frequently asked</h2>
		<Accordion class="space-y-2">
			<AccordionItem value="cancel">
				<AccordionTrigger>Can I cancel any time?</AccordionTrigger>
				<AccordionContent
					>Yes. Cancel from your billing page; access continues until the end of the
					period.</AccordionContent
				>
			</AccordionItem>
			<AccordionItem value="seats">
				<AccordionTrigger>How are seats counted?</AccordionTrigger>
				<AccordionContent
					>A seat is one active member who can log in. Inactive invites don't count.</AccordionContent
				>
			</AccordionItem>
			<AccordionItem value="refunds">
				<AccordionTrigger>Do you offer refunds?</AccordionTrigger>
				<AccordionContent>Within 14 days of purchase, no questions asked.</AccordionContent>
			</AccordionItem>
		</Accordion>
	</section>
</main>
