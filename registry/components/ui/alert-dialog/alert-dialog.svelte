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

	const uid = $props.id();
	const titleId = `alert-dialog-title-${uid}`;
	const descriptionId = `alert-dialog-desc-${uid}`;

	setContext("alert-dialog", {
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
