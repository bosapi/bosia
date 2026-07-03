<script lang="ts">
	let done = $state(false);
	let email = $state("");

	function submit(e: SubmitEvent) {
		e.preventDefault();
		done = true;
	}
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div
			class="relative overflow-hidden rounded-3xl bg-foreground px-8 py-14 text-background sm:px-14"
		>
			<div
				class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
				aria-hidden="true"
			></div>

			<div class="relative mx-auto max-w-xl text-center">
				<h2 class="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
					Start building today
				</h2>
				<p class="mt-3 text-background/70">
					Get product updates and early access. Drop your email — we'll take it from here.
				</p>

				{#if done}
					<p class="mt-6 font-semibold text-primary">Thanks — check your inbox to confirm.</p>
				{:else}
					<form class="mx-auto mt-6 flex max-w-md flex-col gap-2.5 sm:flex-row" onsubmit={submit}>
						<input
							type="email"
							required
							bind:value={email}
							placeholder="you@company.com"
							aria-label="Email"
							class="flex-1 rounded-lg border border-background/20 bg-background/10 px-4 py-3 text-sm text-background outline-none transition placeholder:text-background/50 focus:border-primary"
						/>
						<button
							type="submit"
							class="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
							>Get started</button
						>
					</form>
				{/if}
			</div>
		</div>
	</div>
</section>
