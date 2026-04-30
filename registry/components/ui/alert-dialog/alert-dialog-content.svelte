<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		children,
		...restProps
	}: {
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const dialog = getContext<{
		open: boolean;
		close: () => void;
		titleId: string;
		descriptionId: string;
	}>("alert-dialog");

	let panelEl: HTMLDivElement;
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
</script>

{#if dialog?.open}
	<div
		class="alert-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/80"
		role="presentation"
	>
		<div
			bind:this={panelEl}
			use:focusTrap
			role="alertdialog"
			aria-modal="true"
			aria-labelledby={dialog.titleId}
			aria-describedby={dialog.descriptionId}
			class={cn(
				"alert-dialog-content relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg",
				className,
			)}
			{...restProps}
		>
			{@render children?.()}
		</div>
	</div>
{/if}

<style>
	.alert-dialog-backdrop {
		animation: alert-backdrop-in 0.15s ease-out;
	}

	.alert-dialog-content {
		animation: alert-content-in 0.15s ease-out;
	}

	@keyframes alert-backdrop-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes alert-content-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
