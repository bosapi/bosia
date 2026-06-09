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
	const titleId = `drawer-title-${uid}`;
	const descriptionId = `drawer-desc-${uid}`;

	setContext("drawer", {
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
