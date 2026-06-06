import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

import { OUT_DIR } from "./paths.ts";

// ─── Types ────────────────────────────────────────────────

export type AppHtmlSegments = {
	headOpen: string;
	headClose: string;
	tail: string;
	hasCustomFavicon: boolean;
};

// ─── Cached Singleton ─────────────────────────────────────

let cachedSegments: AppHtmlSegments | undefined;

// ─── Parse & Validate ─────────────────────────────────────

export function loadAppHtmlTemplate(cwd: string = process.cwd()): AppHtmlSegments {
	const templatePath = join(cwd, "src", "app.html");

	if (!existsSync(templatePath)) {
		throw new Error(
			`src/app.html is required but not found. Create src/app.html with %bosia.head% and %bosia.body% placeholders.`,
		);
	}

	let template = readFileSync(templatePath, "utf-8");

	// Replace static placeholders at parse time
	template = replaceStaticPlaceholders(template);

	// Validate required placeholders
	const missingPlaceholders: string[] = [];
	if (!template.includes("%bosia.head%")) missingPlaceholders.push("%bosia.head%");
	if (!template.includes("%bosia.body%")) missingPlaceholders.push("%bosia.body%");

	if (missingPlaceholders.length > 0) {
		throw new Error(
			`src/app.html is missing required placeholder(s): ${missingPlaceholders.join(", ")}. ` +
				`Both %bosia.head% and %bosia.body% must be present.`,
		);
	}

	// Split into segments
	const [headOpen, rest1] = template.split("%bosia.head%", 2);
	const [headClose, tail] = rest1.split("%bosia.body%", 2);

	// Check for custom favicon
	const hasCustomFavicon = headOpen.includes('rel="icon"');

	return {
		headOpen,
		headClose,
		tail,
		hasCustomFavicon,
	};
}

function replaceStaticPlaceholders(template: string): string {
	// Replace %bosia.assets% with BOSIA_ASSETS_BASE env var
	const assetsBase = process.env.BOSIA_ASSETS_BASE || "";
	template = template.replaceAll("%bosia.assets%", assetsBase);

	// Replace %bosia.env.PUBLIC_FOO% with process.env.PUBLIC_FOO
	template = template.replace(/%bosia\.env\.(PUBLIC_[A-Z0-9_]+)%/g, (_match, key: string) => {
		return process.env[key] ?? "";
	});

	return template;
}

// ─── Persisted Segments (production runtime) ──────────────
// At build time we serialize the parsed segments to `${OUT_DIR}/app-html.json`
// so the production runtime can read them without needing `src/app.html` in
// the image. This lets minimal Docker images copy only `dist/`.

export function writeAppHtmlSegments(segments: AppHtmlSegments, outDir: string = OUT_DIR): string {
	const target = join(outDir, "app-html.json");
	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(target, JSON.stringify(segments));
	return target;
}

function readPersistedSegments(cwd: string): AppHtmlSegments | undefined {
	const persistedPath = join(cwd, OUT_DIR, "app-html.json");
	if (!existsSync(persistedPath)) return undefined;
	try {
		return JSON.parse(readFileSync(persistedPath, "utf-8")) as AppHtmlSegments;
	} catch {
		return undefined;
	}
}

// ─── Cached Getter ────────────────────────────────────────

export function getAppHtmlSegments(cwd: string = process.cwd()): AppHtmlSegments {
	if (cachedSegments !== undefined) {
		return cachedSegments;
	}
	// Prefer persisted dist artifact (production runtime — no `src/` in image).
	// Fall back to parsing `src/app.html` directly (dev mode, build step).
	cachedSegments = readPersistedSegments(cwd) ?? loadAppHtmlTemplate(cwd);
	return cachedSegments;
}

// ─── Cache Invalidation ───────────────────────────────────

export function invalidateAppHtmlCache(): void {
	cachedSegments = undefined;
}

// ─── Runtime Interpolation ────────────────────────────────

export function interpolateSegment(
	segment: string,
	vars: { nonce?: string; lang?: string },
): string {
	let result = segment;

	if (vars.lang) {
		result = result.replaceAll("%bosia.lang%", vars.lang);
	}

	if (vars.nonce) {
		result = result.replaceAll("%bosia.nonce%", vars.nonce);
	}

	return result;
}
