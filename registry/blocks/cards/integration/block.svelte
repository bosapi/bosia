<script lang="ts">
	let on = $state(true);
</script>

<div
	class="flex w-full max-w-[280px] flex-col rounded-xl border border-border bg-card p-[18px] text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="flex items-center gap-3">
		<span
			class="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary"
		>
			<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
				<path
					d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.33-1.73-1.33-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.83 1.21 1.83 1.21 1.07 1.79 2.81 1.27 3.5.97.11-.76.42-1.27.76-1.56-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.66 1.66.24 2.88.12 3.18.77.83 1.24 1.88 1.24 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.69.83.57C20.56 21.91 24 17.5 24 12.29 24 5.78 18.63.5 12 .5Z"
				/>
			</svg>
		</span>
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-1.5">
				<span class="font-display text-[15.5px] font-bold">GitHub</span>
				{#if on}
					<span
						class="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold uppercase leading-none tracking-wide text-emerald-600 dark:text-emerald-400"
					>
						Connected
					</span>
				{/if}
			</div>
			<div class="mt-0.5 text-xs text-muted-foreground">Sync issues to cards</div>
		</div>
	</div>
	<p class="my-3.5 text-[13px] leading-snug text-muted-foreground">
		Turn pull requests and issues into live task cards on your board.
	</p>
	<div class="flex items-center justify-between border-t border-border pt-3.5">
		<span class="text-[13px] font-semibold">{on ? "Enabled" : "Disabled"}</span>
		<button
			type="button"
			role="switch"
			aria-checked={on}
			aria-label="Toggle integration"
			onclick={() => (on = !on)}
			class="relative h-[26px] w-11 rounded-full transition-colors {on ? 'bg-primary' : 'bg-muted'}"
		>
			<span
				class="absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-[left] {on
					? 'left-[21px]'
					: 'left-[3px]'}"
			></span>
		</button>
	</div>
</div>
