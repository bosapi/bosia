<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext, tick } from "svelte";
	import type { Snippet } from "svelte";

	let {
		class: className = "",
		align = "end" as "start" | "end" | "center",
		side = "bottom" as "top" | "bottom",
		floating = false,
		anchor = undefined as HTMLElement | undefined,
		children,
		...restProps
	}: {
		class?: string;
		align?: "start" | "end" | "center";
		side?: "top" | "bottom";
		floating?: boolean;
		anchor?: HTMLElement;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const dropdown = getContext<{ open: boolean; triggerEl?: HTMLElement }>("dropdown");

	const alignClasses: Record<string, string> = {
		start: "left-0",
		end: "right-0",
		center: "left-1/2 -translate-x-1/2",
	};

	let menuEl: HTMLDivElement | undefined = $state();
	let floatingTop = $state(0);
	let floatingLeft = $state(0);
	let positioned = $state(false);

	async function updateFloatingPosition() {
		if (!floating) return;
		const target = anchor ?? dropdown?.triggerEl;
		if (!target || !menuEl) return;
		await tick();
		const rect = target.getBoundingClientRect();
		const menuW = menuEl.offsetWidth;
		const menuH = menuEl.offsetHeight;
		const gap = 4;

		let top: number;
		if (side === "top") top = rect.top - menuH - gap;
		else top = rect.bottom + gap;

		let left: number;
		if (align === "start") left = rect.left;
		else if (align === "center") left = rect.left + rect.width / 2 - menuW / 2;
		else left = rect.right - menuW;

		left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
		top = Math.max(8, Math.min(top, window.innerHeight - menuH - 8));

		floatingTop = top;
		floatingLeft = left;
		positioned = true;
	}

	$effect(() => {
		if (!floating) return;
		if (!dropdown?.open) {
			positioned = false;
			return;
		}
		// track anchor so position recomputes when it mounts
		anchor;
		updateFloatingPosition();
		const handler = () => updateFloatingPosition();
		window.addEventListener("scroll", handler, true);
		window.addEventListener("resize", handler);
		return () => {
			window.removeEventListener("scroll", handler, true);
			window.removeEventListener("resize", handler);
		};
	});
</script>

{#if dropdown?.open}
	<div
		bind:this={menuEl}
		class={cn(
			"dropdown-content z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
			floating ? "fixed" : "absolute top-full mt-2",
			!floating && alignClasses[align],
			className,
		)}
		style={floating
			? `top:${floatingTop}px;left:${floatingLeft}px;${positioned ? "" : "visibility:hidden;"}`
			: undefined}
		role="menu"
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}

<style>
	.dropdown-content {
		animation: dropdown-in 0.15s ease-out;
	}

	@keyframes dropdown-in {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-4px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
