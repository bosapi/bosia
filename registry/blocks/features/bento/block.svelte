<script lang="ts">
	import { Sparkles, Gauge, Lock, Workflow } from "@lucide/svelte";
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div class="mx-auto max-w-2xl text-center">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Platform</span>
			<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				One platform, every piece
			</h2>
		</div>

		<div class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
			<!-- Large feature tile -->
			<div
				class="flex flex-col justify-between rounded-2xl border border-border bg-card p-7 text-card-foreground sm:col-span-2 lg:col-span-1 lg:row-span-2"
			>
				<span
					class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
				>
					<Sparkles size={22} />
				</span>
				<div class="mt-8">
					<h3 class="font-display text-xl font-bold">Designed to delight</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
						Thoughtful defaults and a polished interface your team will actually enjoy using every
						day — no training required.
					</p>
				</div>
			</div>

			<!-- Stat tile -->
			<div class="rounded-2xl border border-border bg-card p-7 text-card-foreground">
				<div class="font-display text-4xl font-extrabold tracking-tight text-primary">99.99%</div>
				<p class="mt-1 text-sm text-muted-foreground">Uptime across all regions</p>
			</div>

			<!-- Icon tile -->
			<div class="rounded-2xl border border-border bg-card p-7 text-card-foreground">
				<Gauge size={24} class="text-primary" />
				<h3 class="mt-4 font-display text-base font-bold">Blazing performance</h3>
				<p class="mt-1 text-sm text-muted-foreground">Sub-second loads on the edge.</p>
			</div>

			<!-- Icon tile -->
			<div class="rounded-2xl border border-border bg-card p-7 text-card-foreground">
				<Lock size={24} class="text-primary" />
				<h3 class="mt-4 font-display text-base font-bold">Enterprise security</h3>
				<p class="mt-1 text-sm text-muted-foreground">SSO, audit logs and SLAs.</p>
			</div>

			<!-- Mini-visual tile -->
			<div class="rounded-2xl border border-border bg-card p-7 text-card-foreground">
				<Workflow size={24} class="text-primary" />
				<h3 class="mt-4 font-display text-base font-bold">Automations</h3>
				<div class="mt-3 flex h-16 items-end gap-1.5">
					{#each [40, 65, 30, 80, 55, 90] as h (h)}
						<span class="w-full rounded-sm bg-primary/25" style="height:{h}%"></span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
