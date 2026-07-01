<script lang="ts">
	const cols: Record<string, string[]> = {
		Shop: ["New arrivals", "Best sellers", "Collections", "Gift cards", "Sale"],
		Help: ["Shipping & returns", "Track your order", "Size guide", "Contact us", "FAQ"],
		Company: ["Our story", "Sustainability", "Stores", "Careers", "Journal"],
	};
	// Brand glyphs as inline paths — Lucide v1 no longer ships social/brand icons.
	const socials = [
		{
			label: "Instagram",
			path: "M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2Zm0 3.05A6.75 6.75 0 1 0 18.75 12 6.75 6.75 0 0 0 12 5.25Zm0 11.13A4.38 4.38 0 1 1 16.38 12 4.38 4.38 0 0 1 12 16.38Zm6.95-11.4a1.58 1.58 0 1 0 1.58 1.57 1.58 1.58 0 0 0-1.58-1.57Z",
		},
		{
			label: "Facebook",
			path: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z",
		},
		{
			label: "YouTube",
			path: "M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 3.9 12 3.9 12 3.9s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.5ZM9.6 15.6V8.4l6.2 3.6Z",
		},
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
					aria-label="__BRAND__ home"
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
					<span class="font-display text-[26px] leading-none">__BRAND__</span>
				</a>
				<p class="mt-3.5 max-w-[34ch] text-background/60">
					One thoughtful storefront, made to fit whatever you sell — from produce to fine knitwear.
				</p>
				<div class="mt-5 flex gap-2">
					{#each socials as { label, path } (label)}
						<button
							type="button"
							class="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full text-background/70 transition-colors hover:bg-background/10 hover:text-background"
							aria-label={label}
						>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path d={path} />
							</svg>
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
			<span>© {year} __BRAND__. A multi-purpose store template.</span>
			<span class="flex gap-[18px]">
				<a href="##" class="transition-colors hover:text-background">Privacy</a>
				<a href="##" class="transition-colors hover:text-background">Terms</a>
				<a href="##" class="transition-colors hover:text-background">Cookies</a>
			</span>
		</div>
	</div>
</footer>
