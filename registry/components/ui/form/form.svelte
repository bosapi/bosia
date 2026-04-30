<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";

	let {
		validate = undefined as ((data: FormData) => Record<string, string>) | undefined,
		onsubmit = undefined as ((data: FormData) => void | Promise<void>) | undefined,
		class: className = "",
		children,
		...restProps
	}: {
		validate?: (data: FormData) => Record<string, string>;
		onsubmit?: (data: FormData) => void | Promise<void>;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	let errors = $state<Record<string, string>>({});
	let submitting = $state(false);

	setContext("form", {
		fieldError(name: string) {
			return errors[name];
		},
		setFieldError(name: string, message: string) {
			errors[name] = message;
		},
		clearFieldError(name: string) {
			delete errors[name];
		},
		get submitting() {
			return submitting;
		},
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		if (validate) {
			const result = validate(data);
			errors = result;
			if (Object.keys(result).length > 0) return;
		}

		if (onsubmit) {
			submitting = true;
			try {
				await onsubmit(data);
			} finally {
				submitting = false;
			}
		}
	}

	function handleReset() {
		errors = {};
	}
</script>

<form class={cn(className)} onsubmit={handleSubmit} onreset={handleReset} {...restProps}>
	{@render children?.()}
</form>
