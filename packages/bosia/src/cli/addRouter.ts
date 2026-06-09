// ─── Dispatch logic for `bosia add ...` ──────────────────
// Split out from index.ts so the routing can be unit-tested with injected
// runners (index.ts does top-level `process.argv` parsing on import).

export interface AddRunners {
	runAdd: (names: string[], flags: string[]) => Promise<void> | void;
	runAddBlock: (name: string | undefined, flags: string[]) => Promise<void> | void;
	runAddTheme: (name: string | undefined, flags: string[]) => Promise<void> | void;
	runAddFont: (family: string | undefined, url: string | undefined) => Promise<void> | void;
	runAddList: () => Promise<void> | void;
}

export async function routeAdd(args: string[], runners: AddRunners): Promise<void> {
	const positional = args.filter((a) => !a.startsWith("-"));
	const flags = args.filter((a) => a.startsWith("-"));
	const sub = positional[0];

	if (sub === "block") {
		await runners.runAddBlock(positional[1], flags);
		return;
	}
	if (sub === "theme") {
		const themeFlags = args.filter((a) => a.startsWith("--"));
		await runners.runAddTheme(positional[1], themeFlags);
		return;
	}
	if (sub === "font") {
		await runners.runAddFont(positional[1], positional[2]);
		return;
	}
	if (sub === "list") {
		await runners.runAddList();
		return;
	}

	// Alias: `blocks/<cat>/<name>` tokens dispatch to runAddBlock.
	// Skills/AI agents frequently emit the plural `blocks/...` form alongside
	// `ui/*` components; route those to the block installer transparently
	// and let any remaining plain component names fall through to runAdd.
	const blockTokens = positional.filter((p) => p.startsWith("blocks/"));
	const componentTokens = positional.filter((p) => !p.startsWith("blocks/"));
	if (blockTokens.length > 0) {
		if (componentTokens.length > 0) {
			await runners.runAdd(componentTokens, flags);
		}
		for (const token of blockTokens) {
			await runners.runAddBlock(token.slice("blocks/".length), flags);
		}
		return;
	}

	await runners.runAdd(positional, flags);
}
