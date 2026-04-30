import { getContext, setContext } from "svelte";

const SIDEBAR_CTX = "sidebar";

export interface SidebarState {
	readonly collapsed: boolean;
	toggle: () => void;
}

export function setSidebarContext(state: SidebarState) {
	setContext(SIDEBAR_CTX, state);
}

export function getSidebarContext(): SidebarState {
	return getContext<SidebarState>(SIDEBAR_CTX);
}
