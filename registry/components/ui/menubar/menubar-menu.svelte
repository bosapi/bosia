<script lang="ts">
	import { setContext, getContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		children,
		...restProps
	}: {
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const id = crypto.randomUUID();
	const menubar = getContext<{
		activeMenu: string | null;
		setActive: (id: string) => void;
		close: () => void;
	}>("menubar");

	setContext("menubar-menu", {
		id,
		get isOpen() {
			return menubar.activeMenu === id;
		},
		open() {
			menubar.setActive(id);
		},
		close() {
			menubar.close();
		},
		toggle() {
			if (menubar.activeMenu === id) {
				menubar.close();
			} else {
				menubar.setActive(id);
			}
		},
		get hasActiveMenu() {
			return menubar.activeMenu !== null;
		},
	});
</script>

<div class="relative" {...restProps}>
	{@render children?.()}
</div>
