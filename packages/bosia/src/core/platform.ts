import type { Platform } from "./hooks.ts";

// Set once at boot by the runtime entry — on Workers, the bindings. Isolate-wide,
// so events read it here instead of threading it through every loader call.
let current: Platform | undefined;

export function setPlatform(platform: Platform | undefined): void {
	current = platform;
}

export function getPlatform(): Platform | undefined {
	return current;
}
