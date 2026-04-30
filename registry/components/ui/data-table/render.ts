import type { Component, Snippet } from "svelte";
import type { ComponentDescriptor, SnippetDescriptor } from "./types.ts";

export function renderSnippet(snippet: Snippet): SnippetDescriptor {
	return { type: "snippet", snippet };
}

export function renderComponent<Props extends Record<string, any>>(
	component: Component<Props>,
	props: Props,
): ComponentDescriptor {
	return { type: "component", component, props };
}
