// Dev-only bridge: framework catch sites (renderer, server) push errors into
// the inspector plugin's overlay via a globalThis-set function. The inspector
// is loaded from disk via the user's bosia.config.ts and lives in a separate
// module graph from the bundled server, so a direct import would not share
// state. The global is only set when the inspector plugin is installed; this
// is a safe no-op otherwise.

interface DevReportInput {
	source?: "server" | "uncaught" | "rejection";
	message: string;
	stack?: string;
}

declare global {
	// eslint-disable-next-line no-var
	var __BOSIA_REPORT_ERROR__: ((e: DevReportInput) => void) | undefined;
}

export function reportDevErrorFromCatch(err: unknown): void {
	const fn = globalThis.__BOSIA_REPORT_ERROR__;
	if (typeof fn !== "function") return;
	const e = err as Error | undefined;
	try {
		fn({
			source: "server",
			message: e?.message ?? String(err),
			stack: e?.stack,
		});
	} catch {}
}
