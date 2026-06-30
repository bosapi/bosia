<script lang="ts">
	import { Eye, EyeOff, type LucideIcon } from "@lucide/svelte";

	interface Props {
		label?: string;
		type?: string;
		/** Leading lucide icon, e.g. `Mail` / `Lock`. */
		icon?: LucideIcon;
		placeholder?: string;
		value?: string;
		name?: string;
		helper?: string;
		error?: string;
		autocomplete?: AutoFill;
	}

	let {
		label,
		type = "text",
		icon,
		placeholder,
		value = "",
		name,
		helper,
		error,
		autocomplete,
	}: Props = $props();

	const Icon = $derived(icon);
	const isPassword = $derived(type === "password");
	let show = $state(false);
	// `type` cannot be bound two-way on an <input>, so this stays an uncontrolled field.
	const inputType = $derived(isPassword && show ? "text" : type);
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label for={name} class="text-[13px] font-semibold text-foreground">{label}</label>
	{/if}
	<div class="relative">
		{#if Icon}
			<span
				class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
			>
				<Icon size={18} />
			</span>
		{/if}
		<input
			id={name}
			{name}
			type={inputType}
			{placeholder}
			{value}
			{autocomplete}
			aria-invalid={error ? "true" : undefined}
			class="w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring {Icon
				? 'pl-10'
				: ''} {isPassword ? 'pr-10' : ''} {error
				? 'border-destructive focus:ring-destructive/30'
				: 'border-input focus:border-primary'}"
		/>
		{#if isPassword}
			<button
				type="button"
				tabindex={-1}
				onclick={() => (show = !show)}
				aria-label={show ? "Hide password" : "Show password"}
				class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
			>
				{#if show}<EyeOff size={18} />{:else}<Eye size={18} />{/if}
			</button>
		{/if}
	</div>
	{#if error}
		<span class="text-xs text-destructive">{error}</span>
	{:else if helper}
		<span class="text-xs text-muted-foreground">{helper}</span>
	{/if}
</div>
