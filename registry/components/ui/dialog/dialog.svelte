<script lang="ts">
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		open = $bindable(false),
		children,
		...restProps
	}: {
		open?: boolean;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const titleId = `dialog-title-${Math.random().toString(36).slice(2, 8)}`;
	const descriptionId = `dialog-desc-${Math.random().toString(36).slice(2, 8)}`;

	setContext("dialog", {
		get open() {
			return open;
		},
		toggle() {
			open = !open;
		},
		close() {
			open = false;
		},
		titleId,
		descriptionId,
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && open) {
			e.preventDefault();
			open = false;
		}
	}

	$effect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.body.style.overflow = "";
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{@render children?.()}
