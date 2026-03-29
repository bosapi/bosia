/// <reference types="svelte" />

declare module "*.svelte" {
    import type { Component } from "svelte";
    const component: Component<Record<string, any>, Record<string, any>, any>;
    export default component;
}

declare namespace App {
    interface Locals {
        db: import("./features/drizzle").Database;
        requestTime: number;
    }
}
