<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		direction = "horizontal",
		class: className = "",
		children,
		...restProps
	}: {
		direction?: "horizontal" | "vertical";
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	let sizes: number[] = $state([]);
	let groupEl: HTMLElement | null = $state(null);
	let paneCount = 0;
	let handleCount = 0;

	function registerPane(): number {
		const index = paneCount++;
		sizes = Array.from(
			{ length: paneCount },
			() => Math.round((100 / paneCount) * 1000) / 1000,
		);
		return index;
	}

	function unregisterPane(index: number): void {
		paneCount--;
		if (paneCount > 0) {
			sizes = Array.from(
				{ length: paneCount },
				() => Math.round((100 / paneCount) * 1000) / 1000,
			);
		} else {
			sizes = [];
		}
	}

	function registerHandle(): number {
		return handleCount++;
	}

	function startResize(handleIdx: number, e: PointerEvent, el: HTMLElement): void {
		el.setPointerCapture(e.pointerId);

		const isHorizontal = direction === "horizontal";
		const startPos = isHorizontal ? e.clientX : e.clientY;
		const startSizes = [...sizes];

		const groupRect = groupEl?.getBoundingClientRect();
		if (!groupRect) return;

		const totalPx = isHorizontal ? groupRect.width : groupRect.height;

		function onmove(ev: PointerEvent) {
			const currentPos = isHorizontal ? ev.clientX : ev.clientY;
			const deltaPx = currentPos - startPos;
			const deltaPct = (deltaPx / totalPx) * 100;

			const leftIdx = handleIdx;
			const rightIdx = handleIdx + 1;

			let newLeft = startSizes[leftIdx] + deltaPct;
			let newRight = startSizes[rightIdx] - deltaPct;

			if (newLeft < 0) {
				newRight += newLeft;
				newLeft = 0;
			}
			if (newRight < 0) {
				newLeft += newRight;
				newRight = 0;
			}

			sizes[leftIdx] = Math.round(newLeft * 1000) / 1000;
			sizes[rightIdx] = Math.round(newRight * 1000) / 1000;
		}

		function onup() {
			el.releasePointerCapture(e.pointerId);
			el.removeEventListener("pointermove", onmove);
			el.removeEventListener("pointerup", onup);
		}

		el.addEventListener("pointermove", onmove);
		el.addEventListener("pointerup", onup);
	}

	setContext("resizable", {
		get direction() {
			return direction;
		},
		get sizes() {
			return sizes;
		},
		registerPane,
		unregisterPane,
		registerHandle,
		startResize,
	});
</script>

<div
	bind:this={groupEl}
	data-slot="resizable-pane-group"
	data-direction={direction}
	class={cn("flex h-full w-full data-[direction=vertical]:flex-col", className)}
	{...restProps}
>
	{@render children?.()}
</div>
