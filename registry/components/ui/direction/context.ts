import { getContext, setContext } from "svelte";

export type Direction = "ltr" | "rtl";

const DIRECTION_CTX = "direction";

export interface DirectionState {
	readonly direction: Direction;
}

export function setDirectionContext(state: DirectionState) {
	setContext(DIRECTION_CTX, state);
}

export function getDirectionContext(): Direction {
	return getContext<DirectionState>(DIRECTION_CTX)?.direction ?? "ltr";
}

export const useDirection = getDirectionContext;
