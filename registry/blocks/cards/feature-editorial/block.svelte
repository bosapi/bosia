<script lang="ts">
	import { Card } from "$lib/components/ui/card";
</script>

<Card
	class="relative flex w-full flex-col rounded-3xl border-0 bg-card p-10 text-card-foreground shadow-none"
>
	<header class="flex items-start justify-between">
		<span class="font-display text-2xl italic leading-none text-accent">01</span>
		<span class="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
			Skills
		</span>
	</header>

	<div class="mt-8 text-foreground/80">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="28"
			height="28"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="11" cy="11" r="7" />
			<line x1="16.2" y1="16.2" x2="21" y2="21" />
		</svg>
	</div>

	<h3 class="mt-8 text-4xl font-bold leading-[1.05] tracking-tight text-foreground">
		Skills,<br />not plugins
	</h3>

	<p class="mt-6 max-w-[28ch] text-lg leading-snug text-foreground/80">
		31 file-based <code class="font-mono text-base">SKILL.md</code> bundles. Drop a folder in, restart
		the daemon, it appears.
	</p>

	<div class="mt-auto flex justify-end pt-6">
		<a
			href="#"
			class="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/40 text-foreground transition-colors hover:bg-foreground hover:text-background"
			aria-label="Read more"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="7" y1="17" x2="17" y2="7" />
				<polyline points="7 7 17 7 17 17" />
			</svg>
		</a>
	</div>
</Card>
