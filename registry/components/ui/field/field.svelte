<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { getContext, setContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		name = undefined as string | undefined,
		error = undefined as string | undefined,
		class: className = "",
		children,
		...restProps
	}: {
		name?: string;
		error?: string;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const formCtx = getContext<{ fieldError: (name: string) => string | undefined } | undefined>(
		"form",
	);

	const resolvedError = $derived.by(() => {
		if (error) return error;
		if (name && formCtx) return formCtx.fieldError(name);
		return undefined;
	});

	const uid = crypto.randomUUID().slice(0, 8);
	const id = `field-${uid}`;
	const descriptionId = `field-desc-${uid}`;
	const errorId = `field-err-${uid}`;

	setContext("field", {
		get id() {
			return id;
		},
		get descriptionId() {
			return descriptionId;
		},
		get errorId() {
			return errorId;
		},
		get error() {
			return resolvedError;
		},
	});
</script>

<div class={cn("grid gap-1.5", className)} {...restProps}>
	{@render children?.()}
</div>
