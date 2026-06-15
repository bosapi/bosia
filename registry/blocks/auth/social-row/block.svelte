<script lang="ts">
	type Provider = "google" | "apple" | "github" | "microsoft";

	interface Props {
		providers?: Provider[];
		/** Compact icon-only buttons in a 3-up grid. */
		grid?: boolean;
		label?: string;
		onpick?: (provider: Provider) => void;
	}

	let {
		providers = ["google", "apple", "github"],
		grid = false,
		label = "Continue with",
		onpick,
	}: Props = $props();

	const names: Record<Provider, string> = {
		google: "Google",
		apple: "Apple",
		github: "GitHub",
		microsoft: "Microsoft",
	};
</script>

<!-- Brand logomarks keep their official colours (Google, Microsoft); monochrome marks
     (Apple, GitHub) inherit currentColor so they follow the theme's foreground. -->
{#snippet logo(provider: Provider)}
	{#if provider === "google"}
		<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.98 10.98 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
			/>
		</svg>
	{:else if provider === "apple"}
		<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
			<path
				d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.89 2.65 3.23 2.6 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.03 2.29-1.27 3.14-2.53.99-1.45 1.4-2.86 1.42-2.93-.03-.01-2.72-1.04-2.75-4.13zM14.53 4.6c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z"
			/>
		</svg>
	{:else if provider === "github"}
		<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
			<path
				d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"
			/>
		</svg>
	{:else if provider === "microsoft"}
		<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
			<rect x="1" y="1" width="10" height="10" fill="#F25022" />
			<rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
			<rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
			<rect x="13" y="13" width="10" height="10" fill="#FFB900" />
		</svg>
	{/if}
{/snippet}

<div class={grid ? "grid grid-cols-3 gap-2.5" : "flex flex-col gap-2.5"}>
	{#each providers as provider (provider)}
		<button
			type="button"
			onclick={() => onpick?.(provider)}
			aria-label="{label} {names[provider]}"
			class="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-input bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
		>
			{@render logo(provider)}
			{#if !grid}<span>{label} {names[provider]}</span>{/if}
		</button>
	{/each}
</div>
