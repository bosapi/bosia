<script lang="ts"></script>

<div
	class="flex w-full max-w-[300px] flex-col rounded-xl border border-border bg-card p-[26px] text-card-foreground shadow-md"
>
	<div
		class="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"
	>
		<svg viewBox="0 0 32 32" width="24" fill="none">
			<rect x="11.5" y="4" width="16.5" height="21" rx="3.2" fill="currentColor" opacity="0.4" />
			<rect x="4" y="8" width="16.5" height="21" rx="3.2" fill="currentColor" />
		</svg>
	</div>
	<h3 class="mb-1 font-display text-2xl font-extrabold tracking-tight">Welcome back</h3>
	<p class="mb-[18px] text-[13.5px] text-muted-foreground">Sign in to your Bosia workspace.</p>
	<div class="flex flex-col gap-3">
		<div>
			<div class="mb-1.5 text-xs font-semibold">Email</div>
			<input
				type="email"
				value="ana@bosia.dev"
				class="w-full rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm text-foreground"
			/>
		</div>
		<div>
			<div class="mb-1.5 flex justify-between">
				<span class="text-xs font-semibold">Password</span>
				<span class="text-xs font-semibold text-primary">Forgot?</span>
			</div>
			<input
				type="password"
				value="password"
				class="w-full rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm text-foreground"
			/>
		</div>
	</div>
	<button
		type="button"
		class="mt-[18px] inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-[13px] font-semibold text-primary-foreground transition hover:brightness-110"
	>
		Sign in
	</button>
	<div class="my-4 flex items-center gap-2.5">
		<div class="h-px flex-1 bg-border"></div>
		<span class="text-[11.5px] text-muted-foreground/70">OR</span>
		<div class="h-px flex-1 bg-border"></div>
	</div>
	<button
		type="button"
		class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2.5 text-[13px] font-semibold text-foreground transition hover:bg-secondary"
	>
		<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
			<path
				d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.33-1.73-1.33-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.83 1.21 1.83 1.21 1.07 1.79 2.81 1.27 3.5.97.11-.76.42-1.27.76-1.56-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.66 1.66.24 2.88.12 3.18.77.83 1.24 1.88 1.24 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.69.83.57C20.56 21.91 24 17.5 24 12.29 24 5.78 18.63.5 12 .5Z"
			/>
		</svg> Continue with GitHub
	</button>
</div>
