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

// True only while server.workers.ts renders `/` once at isolate startup, so V8
// compiles the render path before the first real request. That render runs no
// user hooks, loaders, metadata() or +server.ts handlers — startup has no
// bindings, and a hook caching a failed `connect()` would break the isolate —
// and never touches the response cache.
export let warmingUp = false;

export function setWarmingUp(on: boolean): void {
	warmingUp = on;
}
