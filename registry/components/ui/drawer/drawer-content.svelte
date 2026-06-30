<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		closeOnBackdropClick = true,
		showHandle = true,
		children,
		...restProps
	}: {
		class?: string;
		closeOnBackdropClick?: boolean;
		showHandle?: boolean;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const drawer = getContext<{
		open: boolean;
		close: () => void;
		titleId: string;
		descriptionId: string;
	}>("drawer");

	let previouslyFocused: HTMLElement | null = null;

	function focusTrap(node: HTMLDivElement) {
		previouslyFocused = document.activeElement as HTMLElement;

		const focusableSelector =
			'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

		function focusFirst() {
			const first = node.querySelector<HTMLElement>(focusableSelector);
			first?.focus();
		}

		function handleKeydown(e: KeyboardEvent) {
			if (e.key !== "Tab") return;

			const focusable = [...node.querySelectorAll<HTMLElement>(focusableSelector)];
			if (focusable.length === 0) {
				e.preventDefault();
				return;
			}

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}

		focusFirst();
		node.addEventListener("keydown", handleKeydown);

		return {
			destroy() {
				node.removeEventListener("keydown", handleKeydown);
				previouslyFocused?.focus();
			},
		};
	}

	function handleBackdropClick(e: MouseEvent) {
		if (closeOnBackdropClick && e.target === e.currentTarget) {
			drawer.close();
		}
	}
</script>

{#if drawer?.open}
	<div
		class="drawer-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/80"
		onclick={handleBackdropClick}
		role="presentation"
	>
		<div
			use:focusTrap
			role="dialog"
			aria-modal="true"
			aria-labelledby={drawer.titleId}
			aria-describedby={drawer.descriptionId}
			class={cn(
				"drawer-content relative flex max-h-[85vh] w-full flex-col rounded-t-lg border bg-background shadow-lg",
				className,
			)}
			{...restProps}
		>
			{#if showHandle}
				<div
					aria-hidden="true"
					class="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-muted"
				></div>
			{/if}
			<div class="overflow-y-auto p-6">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.drawer-backdrop {
		animation: backdrop-in 0.2s ease-out;
	}

	.drawer-content {
		animation: content-in 0.25s cubic-bezier(0.32, 0.72, 0, 1);
	}

	@keyframes backdrop-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes content-in {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
</style>
