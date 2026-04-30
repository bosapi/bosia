import { writable } from "svelte/store";

export type ToastType = "default" | "success" | "error" | "info" | "warning";

export interface Toast {
	id: string;
	message: string;
	description?: string;
	type: ToastType;
	dismissing?: boolean;
}

let nextId = 0;
const DURATION = 4000;
const DISMISS_MS = 300;

export const toasts = writable<Toast[]>([]);

function add(message: string, type: ToastType, opts?: { description?: string }): string {
	const id = String(nextId++);
	toasts.update((t) => [...t, { id, message, type, description: opts?.description }]);

	setTimeout(() => dismiss(id), DURATION);
	return id;
}

function dismiss(id: string) {
	toasts.update((t) => t.map((item) => (item.id === id ? { ...item, dismissing: true } : item)));
	setTimeout(() => {
		toasts.update((t) => t.filter((item) => item.id !== id));
	}, DISMISS_MS);
}

export function toast(message: string, opts?: { description?: string }) {
	return add(message, "default", opts);
}

toast.success = (message: string, opts?: { description?: string }) => add(message, "success", opts);

toast.error = (message: string, opts?: { description?: string }) => add(message, "error", opts);

toast.info = (message: string, opts?: { description?: string }) => add(message, "info", opts);

toast.warning = (message: string, opts?: { description?: string }) => add(message, "warning", opts);

toast.dismiss = dismiss;
