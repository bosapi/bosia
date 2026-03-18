/// <reference types="svelte" />

declare module "*.svelte" {
    import type { Component } from "svelte";
    const component: Component<Record<string, any>, Record<string, any>, any>;
    export default component;
}

/** Shape of event passed to a +page.server.ts load() function */
export interface PageLoadEvent {
    params: Record<string, string>;
    url: URL;
    locals: Record<string, any>;
    fetch: typeof globalThis.fetch;
    parent: () => Promise<Record<string, any>>;
}

/** Shape of event passed to a +layout.server.ts load() function */
export interface LayoutLoadEvent {
    params: Record<string, string>;
    url: URL;
    locals: Record<string, any>;
    fetch: typeof globalThis.fetch;
    parent: () => Promise<Record<string, any>>;
}
