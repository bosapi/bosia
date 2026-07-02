<script lang="ts">
	import { Check } from "@lucide/svelte";

	interface Props {
		user?: { name: string; email: string };
		onSave?: (user: { name: string; email: string }) => void;
	}

	let { user = { name: "Jeki Maulana", email: "jeki@bosia.dev" }, onSave }: Props = $props();

	let name = $state(user.name);
	let email = $state(user.email);
	let orderUpdates = $state(true);
	let newArrivals = $state(true);
	let promotions = $state(false);
	let saved = $state(false);

	function save(e: SubmitEvent) {
		e.preventDefault();
		onSave?.({ name, email });
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}
</script>

{#snippet toggle(label: string, sub: string, checked: boolean, set: (v: boolean) => void)}
	<label class="flex cursor-pointer items-center justify-between gap-4 py-3">
		<span>
			<span class="block text-[15px] font-medium">{label}</span>
			<span class="block text-[13px] text-muted-foreground/70">{sub}</span>
		</span>
		<input
			type="checkbox"
			{checked}
			onchange={(e) => set(e.currentTarget.checked)}
			class="peer sr-only"
		/>
		<span
			class="relative h-6 w-10 flex-none rounded-full bg-muted transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-background after:shadow after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-4"
		></span>
	</label>
{/snippet}

<form onsubmit={save} class="flex max-w-xl flex-col gap-8">
	<fieldset class="flex flex-col gap-4">
		<legend class="mb-3 font-display text-lg">Profile</legend>
		<label class="flex flex-col gap-1.5 text-sm font-medium">
			Name
			<input
				bind:value={name}
				required
				class="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none transition focus:border-primary"
			/>
		</label>
		<label class="flex flex-col gap-1.5 text-sm font-medium">
			Email
			<input
				type="email"
				bind:value={email}
				required
				class="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none transition focus:border-primary"
			/>
		</label>
	</fieldset>

	<fieldset class="flex flex-col gap-4">
		<legend class="mb-3 font-display text-lg">Password</legend>
		<div class="grid gap-4 sm:grid-cols-2">
			<label class="flex flex-col gap-1.5 text-sm font-medium">
				Current password
				<input
					type="password"
					placeholder="••••••••"
					autocomplete="current-password"
					class="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none transition focus:border-primary"
				/>
			</label>
			<label class="flex flex-col gap-1.5 text-sm font-medium">
				New password
				<input
					type="password"
					placeholder="At least 8 characters"
					autocomplete="new-password"
					class="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none transition focus:border-primary"
				/>
			</label>
		</div>
	</fieldset>

	<fieldset>
		<legend class="mb-1 font-display text-lg">Notifications</legend>
		<div class="flex flex-col divide-y divide-border">
			{@render toggle(
				"Order updates",
				"Shipping and delivery notifications",
				orderUpdates,
				(v) => (orderUpdates = v),
			)}
			{@render toggle(
				"New arrivals",
				"A short note when new pieces land",
				newArrivals,
				(v) => (newArrivals = v),
			)}
			{@render toggle(
				"Promotions",
				"Occasional offers and seasonal sales",
				promotions,
				(v) => (promotions = v),
			)}
		</div>
	</fieldset>

	<div class="flex items-center gap-3">
		<button
			type="submit"
			class="inline-flex w-fit items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition hover:brightness-110"
		>
			Save changes
		</button>
		{#if saved}
			<span class="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
				<Check size={15} /> Saved
			</span>
		{/if}
	</div>
</form>
