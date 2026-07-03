<script lang="ts">
	import { Check } from "@lucide/svelte";

	const rows = [
		{
			kicker: "Collaboration",
			title: "Work together, in real time",
			body: "Everyone stays in sync. Comments, mentions and live cursors keep the whole team moving as one.",
			points: ["Live multiplayer editing", "Threaded comments", "Granular roles & permissions"],
			flip: false,
		},
		{
			kicker: "Automation",
			title: "Let the busywork run itself",
			body: "Trigger workflows on any event and connect the tools you already use. Set it once and forget it.",
			points: ["Visual workflow builder", "200+ integrations", "Webhooks & a full API"],
			flip: true,
		},
	];
</script>

<section class="w-full bg-background">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:py-24 lg:gap-24">
		{#each rows as row (row.title)}
			<div class="grid items-center gap-10 lg:grid-cols-2">
				<div class={row.flip ? "lg:order-2" : ""}>
					<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary"
						>{row.kicker}</span
					>
					<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
						{row.title}
					</h2>
					<p class="mt-3 text-lg text-muted-foreground">{row.body}</p>
					<ul class="mt-6 flex flex-col gap-3">
						{#each row.points as point (point)}
							<li class="flex items-center gap-2.5 text-sm">
								<span
									class="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary/10 text-primary"
								>
									<Check size={12} />
								</span>
								{point}
							</li>
						{/each}
					</ul>
				</div>

				<div
					class="flex aspect-[4/3] items-center justify-center rounded-2xl border border-border bg-muted {row.flip
						? 'lg:order-1'
						: ''}"
				>
					<div class="grid w-2/3 gap-3">
						<div class="h-3 w-1/2 rounded-full bg-primary/30"></div>
						<div class="h-3 w-full rounded-full bg-border"></div>
						<div class="h-3 w-5/6 rounded-full bg-border"></div>
						<div class="mt-3 h-16 rounded-lg bg-card shadow-sm"></div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
