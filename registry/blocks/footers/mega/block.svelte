<script lang="ts">
	import { MapPin, Mail, Phone } from "@lucide/svelte";

	const cols: Record<string, string[]> = {
		Product: ["Overview", "Features", "Pricing", "Integrations", "Changelog"],
		Solutions: ["Startups", "Enterprise", "Agencies", "Education"],
		Developers: ["Docs", "API reference", "Status", "Open source"],
		Company: ["About", "Careers", "Blog", "Press"],
		Support: ["Help centre", "Community", "Contact", "Security"],
	};
	const year = new Date().getFullYear();
</script>

<footer class="w-full border-t border-border bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 pb-6 pt-14 sm:pt-16">
		<div class="grid gap-10 lg:grid-cols-[repeat(5,1fr)_1.4fr]">
			{#each Object.entries(cols) as [heading, links] (heading)}
				<div>
					<h5 class="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
						{heading}
					</h5>
					{#each links as link (link)}
						<a
							href="##"
							class="block py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
							>{link}</a
						>
					{/each}
				</div>
			{/each}

			<div>
				<h5 class="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
					Get in touch
				</h5>
				<ul class="space-y-3 text-sm text-muted-foreground">
					<li class="flex items-start gap-2.5">
						<MapPin size={16} class="mt-0.5 shrink-0 text-primary" />
						<span>100 Market St, Suite 400<br />San Francisco, CA</span>
					</li>
					<li class="flex items-center gap-2.5">
						<Mail size={16} class="shrink-0 text-primary" />
						<a href="##" class="transition-colors hover:text-foreground">hello@example.com</a>
					</li>
					<li class="flex items-center gap-2.5">
						<Phone size={16} class="shrink-0 text-primary" />
						<a href="##" class="transition-colors hover:text-foreground">+1 (555) 012-3456</a>
					</li>
				</ul>
			</div>
		</div>

		<div
			class="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground"
		>
			<div class="flex flex-wrap items-center gap-4">
				<a href="##" class="font-display font-extrabold tracking-tight text-foreground">__BRAND__</a
				>
				<span>© {year} __BRAND__, Inc.</span>
			</div>
			<div class="flex items-center gap-2">
				<select
					class="h-9 rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:border-primary"
					aria-label="Language"
				>
					<option>English</option>
					<option>Español</option>
					<option>Deutsch</option>
				</select>
				<select
					class="h-9 rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:border-primary"
					aria-label="Currency"
				>
					<option>USD $</option>
					<option>EUR €</option>
					<option>GBP £</option>
				</select>
			</div>
		</div>
	</div>
</footer>
