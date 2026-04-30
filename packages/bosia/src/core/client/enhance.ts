// ─── use:enhance ──────────────────────────────────────────
// Progressive enhancement for `<form method="POST">`. Intercepts
// submission, POSTs via fetch with `x-bosia-action: 1`, parses the
// JSON action result, and updates shared form/page state without a
// full page reload. Falls back to native form submission when JS is
// disabled because nothing is wired up until this action runs.

import { appState, refreshData } from "./appState.svelte.ts";
import { router } from "./router.svelte.ts";

export type ActionResult =
	| { type: "success"; status: number; data: any }
	| { type: "failure"; status: number; data: any }
	| { type: "redirect"; status: number; location: string }
	| { type: "error"; status: number; message: string };

export type SubmitFunction = (input: {
	formData: FormData;
	formElement: HTMLFormElement;
	action: URL;
	cancel: () => void;
	submitter: HTMLElement | null;
}) =>
	| void
	| ((opts: {
			result: ActionResult;
			formElement: HTMLFormElement;
			update: (opts?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
	  }) => void | Promise<void>);

async function applyResult(
	result: ActionResult,
	form: HTMLFormElement,
	opts: { reset?: boolean; invalidateAll?: boolean } = {},
): Promise<void> {
	const reset = opts.reset !== false;
	const invalidateAll = opts.invalidateAll !== false;

	if (result.type === "redirect") {
		router.navigate(result.location);
		return;
	}
	if (result.type === "error") {
		appState.form = { error: { message: result.message, status: result.status } };
		console.warn(`[bosia] action error ${result.status}: ${result.message}`);
		return;
	}
	if (result.type === "failure") {
		appState.form = result.data;
		return;
	}
	// success
	appState.form = result.data;
	if (reset) form.reset();
	if (invalidateAll) {
		await refreshData(window.location.pathname + window.location.search);
	}
}

export function enhance(form: HTMLFormElement, submit?: SubmitFunction) {
	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const submitter = (event.submitter as HTMLElement | null) ?? null;
		const formData = new FormData(form, submitter as HTMLElement | undefined);

		// Resolve action URL — preserve `?/actionName` if the submitter or form sets it
		const actionAttr =
			(submitter as HTMLButtonElement | HTMLInputElement | null)?.formAction ||
			form.action ||
			window.location.href;
		const action = new URL(actionAttr, window.location.href);

		let cancelled = false;
		const cancel = () => {
			cancelled = true;
		};

		const callback = submit?.({ formData, formElement: form, action, cancel, submitter });
		if (cancelled) return;

		let result: ActionResult;
		try {
			const res = await fetch(action, {
				method: "POST",
				body: formData,
				headers: { "x-bosia-action": "1", accept: "application/json" },
			});
			result = (await res.json()) as ActionResult;
		} catch (err) {
			const message = (err as Error)?.message ?? "Network error";
			result = { type: "error", status: 0, message };
			console.warn("[bosia] enhance: submission failed", err);
		}

		const update = (opts?: { reset?: boolean; invalidateAll?: boolean }) =>
			applyResult(result, form, opts ?? {});

		if (typeof callback === "function") {
			await callback({ result, formElement: form, update });
		} else {
			await update();
		}
	}

	form.addEventListener("submit", handleSubmit);
	return {
		destroy() {
			form.removeEventListener("submit", handleSubmit);
		},
	};
}
