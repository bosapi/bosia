<script lang="ts">
	import { Instagram, Facebook, Youtube } from "@lucide/svelte";

	const cols: Record<string, string[]> = {
		Shop: ["New arrivals", "Best sellers", "Collections", "Gift cards", "Sale"],
		Help: ["Shipping & returns", "Track your order", "Size guide", "Contact us", "FAQ"],
		Company: ["Our story", "Sustainability", "Stores", "Careers", "Journal"],
	};
	const socials = [
		{ label: "Instagram", icon: Instagram },
		{ label: "Facebook", icon: Facebook },
		{ label: "YouTube", icon: Youtube },
	];
	const year = new Date().getFullYear();
</script>

<footer class="bg-foreground text-background/70">
	<div class="mx-auto w-full max-w-6xl px-6 pb-8 pt-16 sm:pt-20">
		<div
			class="grid gap-10 border-b border-background/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]"
		>
			<div>
				<a
					href="##"
					class="inline-flex items-center gap-2.5 text-background"
					aria-label="Mercato home"
				>
					<span class="block h-9 w-9">
						<svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
							<path d="M5 12 H35" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
							<path
								d="M6 12 V18.5 Q9.62 24.5 13.25 18.5 Q16.87 24.5 20.5 18.5 Q24.12 24.5 27.75 18.5 Q31.37 24.5 35 18.5 V12 Z"
								fill="currentColor"
							/>
							<path
								d="M9 30 V24 a3 3 0 0 1 6 0 V30"
								stroke="currentColor"
								stroke-width="2.4"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M22 30 V25 H31 V30"
								stroke="currentColor"
								stroke-width="2.4"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</span>
					<span class="font-display text-[26px] leading-none">Mercato</span>
				</a>
				<p class="mt-3.5 max-w-[34ch] text-background/60">
					One thoughtful storefront, made to fit whatever you sell — from produce to fine knitwear.
				</p>
				<div class="mt-5 flex gap-2">
					{#each socials as { label, icon: Icon } (label)}
						<button
							type="button"
							class="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full text-background/70 transition-colors hover:bg-background/10 hover:text-background"
							aria-label={label}
						>
							<Icon size={18} />
						</button>
					{/each}
				</div>
			</div>

			{#each Object.entries(cols) as [heading, links] (heading)}
				<div>
					<h5 class="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-background/60">
						{heading}
					</h5>
					{#each links as link (link)}
						<a
							href="##"
							class="block py-1.5 text-[15px] text-background/70 transition-colors hover:text-background"
							>{link}</a
						>
					{/each}
				</div>
			{/each}
		</div>

		<div
			class="flex flex-wrap items-center justify-between gap-4 pt-7 text-[13px] text-background/60"
		>
			<span>© {year} Mercato. A multi-purpose store template.</span>
			<span class="flex gap-[18px]">
				<a href="##" class="transition-colors hover:text-background">Privacy</a>
				<a href="##" class="transition-colors hover:text-background">Terms</a>
				<a href="##" class="transition-colors hover:text-background">Cookies</a>
			</span>
		</div>
	</div>
</footer>
