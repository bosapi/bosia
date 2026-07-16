<script lang="ts">
	import { Mail, MapPin, Phone } from "@lucide/svelte";

	let { action = "/api/contact" }: { action?: string } = $props();

	const details = [
		{ icon: Mail, label: "Email", value: "jeki@bosia.dev" },
		{ icon: Phone, label: "Phone", value: "+62 812 3456 7890" },
		{ icon: MapPin, label: "Office", value: "Jl. Merdeka 17, Bandung" },
	];

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
	<div class="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
		<div class="max-w-md">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Contact</span>
			<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				Let's talk about your project
			</h2>
			<p class="mt-4 text-muted-foreground">
				Tell us what you're building. We reply to every message within one business day.
			</p>
			<ul class="mt-8 flex flex-col gap-5">
				{#each details as d (d.label)}
					<li class="flex items-center gap-4">
						<span
							class="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary"
						>
							<d.icon size={19} />
						</span>
						<span>
							<span
								class="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
								>{d.label}</span
							>
							<span class="block text-sm font-semibold">{d.value}</span>
						</span>
					</li>
				{/each}
			</ul>
		</div>

		<div class="rounded-2xl border border-border bg-card p-6 text-card-foreground sm:p-8">
			{#if status === "sent"}
				<p class="font-semibold text-primary">Thanks — your message is on its way.</p>
				<p class="mt-2 text-sm text-muted-foreground">We'll get back to you shortly.</p>
			{:else}
				<form class="flex flex-col gap-4" onsubmit={submit}>
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-semibold">Name</span>
						<input
							type="text"
							required
							bind:value={name}
							placeholder="Your name"
							class="rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
						/>
					</label>
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-semibold">Email</span>
						<input
							type="email"
							required
							bind:value={email}
							placeholder="you@company.com"
							class="rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
						/>
					</label>
					<label class="flex flex-col gap-1.5">
						<span class="text-sm font-semibold">Message</span>
						<textarea
							required
							rows="5"
							bind:value={message}
							placeholder="What can we help with?"
							class="resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
						></textarea>
					</label>
					{#if status === "error"}
						<p class="text-sm font-semibold text-destructive">
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
