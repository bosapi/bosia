<script lang="ts">
	let { action = "/api/contact" }: { action?: string } = $props();

	let name = $state("");
	let email = $state("");
	let message = $state("");
	let status: "idle" | "sending" | "sent" | "error" = $state("idle");

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		status = "sending";
		try {
			const res = await fetch(action, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, message }),
			});
			status = res.ok ? "sent" : "error";
		} catch {
			status = "error";
		}
	}
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div class="mx-auto max-w-xl text-center">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Contact</span>
			<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				Get in touch
			</h2>
			<p class="mt-4 text-muted-foreground">
				Questions, feedback or a project in mind — drop us a line and we'll reply within one
				business day.
			</p>
		</div>

		<div class="mx-auto mt-10 max-w-xl">
			{#if status === "sent"}
				<p class="text-center font-semibold text-primary">Thanks — your message is on its way.</p>
			{:else}
				<form class="flex flex-col gap-4" onsubmit={submit}>
					<div class="grid gap-4 sm:grid-cols-2">
						<input
							type="text"
							required
							bind:value={name}
							placeholder="Your name"
							aria-label="Name"
							class="rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
						/>
						<input
							type="email"
							required
							bind:value={email}
							placeholder="you@company.com"
							aria-label="Email"
							class="rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
						/>
					</div>
					<textarea
						required
						rows="5"
						bind:value={message}
						placeholder="What can we help with?"
						aria-label="Message"
						class="resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
					></textarea>
					{#if status === "error"}
						<p class="text-center text-sm font-semibold text-destructive">
							Something went wrong — please try again.
						</p>
					{/if}
					<button
						type="submit"
						disabled={status === "sending"}
						class="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
					>
						{status === "sending" ? "Sending…" : "Send message"}
					</button>
				</form>
			{/if}
		</div>
	</div>
</section>
