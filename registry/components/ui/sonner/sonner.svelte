<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { toasts, toast } from "./toast.svelte.ts";
	import type { ToastType } from "./toast.svelte.ts";

	type Position =
		| "top-left"
		| "top-right"
		| "bottom-left"
		| "bottom-right"
		| "top-center"
		| "bottom-center";

	let {
		class: className = "",
		position = "bottom-right" as Position,
		...restProps
	}: {
		class?: string;
		position?: Position;
		[key: string]: any;
	} = $props();

	const positionClasses: Record<Position, string> = {
		"top-left": "top-4 left-4 items-start",
		"top-right": "top-4 right-4 items-end",
		"top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
		"bottom-left": "bottom-4 left-4 items-start",
		"bottom-right": "bottom-4 right-4 items-end",
		"bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
	};

	const typeClasses: Record<ToastType, string> = {
		default: "bg-popover text-popover-foreground border-border",
		success:
			"bg-popover text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
		error: "bg-popover text-destructive border-destructive/30",
		info: "bg-popover text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800",
		warning:
			"bg-popover text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800",
	};

	function handleDismiss(id: string) {
		toast.dismiss(id);
	}
</script>

{#if $toasts.length > 0}
	<div
		class={cn(
			"fixed z-50 flex flex-col gap-2 pointer-events-none",
			positionClasses[position],
			className,
		)}
		{...restProps}
	>
		{#each $toasts as t (t.id)}
			<div
				class={cn(
					"pointer-events-auto w-[356px] rounded-lg border px-4 py-3 shadow-lg transition-all duration-300",
					t.dismissing ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0",
					typeClasses[t.type],
				)}
				role="status"
				aria-live="polite"
			>
				<div class="flex items-start justify-between gap-2">
					<div class="flex-1">
						<p class="text-sm font-semibold">{t.message}</p>
						{#if t.description}
							<p class="mt-1 text-xs text-muted-foreground">
								{t.description}
							</p>
						{/if}
					</div>
					<button
						type="button"
						class="shrink-0 rounded-md p-0.5 text-muted-foreground hover:text-foreground"
						onclick={() => handleDismiss(t.id)}
						aria-label="Dismiss"
					>
						<svg
							class="size-4"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18" /><line
								x1="6"
								y1="6"
								x2="18"
								y2="18"
							/>
						</svg>
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}
