<script lang="ts">
	let {
		action = "/api/newsletter",
		kicker = "Newsletter",
		heading = "The monthly build log",
		copy = "What we shipped, what broke and what we learned — straight from the team, once a month.",
		note = "No spam. Unsubscribe with one click, anytime.",
	}: {
		action?: string;
		kicker?: string;
		heading?: string;
		copy?: string;
		note?: string;
	} = $props();

	let email = $state("");
	let status: "idle" | "sending" | "sent" | "error" = $state("idle");

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		status = "sending";
		try {
			const res = await fetch(action, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			status = res.ok ? "sent" : "error";
		} catch {
			status = "error";
		}
	}
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div
			class="grid items-center gap-10 rounded-2xl border border-border bg-card p-8 text-card-foreground sm:p-12 lg:grid-cols-2"
		>
			<div>
				<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{kicker}</span>
				<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
					{heading}
				</h2>
				<p class="mt-4 text-muted-foreground">{copy}</p>
			</div>

			<div>
				{#if status === "sent"}
					<p class="font-semibold text-primary">You're on the list — see you in the next one.</p>
				{:else}
					<form class="flex flex-col gap-3" onsubmit={submit}>
						<input
							type="email"
							required
							bind:value={email}
							placeholder="you@company.com"
							aria-label="Email"
							class="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
						/>
						<button
							type="submit"
							disabled={status === "sending"}
							class="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
						>
							{status === "sending" ? "Subscribing…" : "Subscribe"}
						</button>
						{#if status === "error"}
							<p class="text-sm font-semibold text-destructive">
								Something went wrong — please try again.
							</p>
						{:else}
							<p class="text-xs text-muted-foreground">{note}</p>
						{/if}
					</form>
				{/if}
			</div>
		</div>
	</div>
</section>
