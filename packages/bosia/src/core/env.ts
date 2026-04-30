import { existsSync, readFileSync } from "fs";
import { join } from "path";

// ─── Framework-reserved vars ─────────────────────────────
// These are controlled by Bosia itself — users access them via process.env directly.
const FRAMEWORK_VARS = new Set([
	"PORT",
	"NODE_ENV",
	"BODY_SIZE_LIMIT",
	"CSRF_ALLOWED_ORIGINS",
	"INTERNAL_HOSTS",
	"CORS_ALLOWED_ORIGINS",
	"CORS_ALLOWED_METHODS",
	"CORS_ALLOWED_HEADERS",
	"CORS_EXPOSED_HEADERS",
	"CORS_CREDENTIALS",
	"CORS_MAX_AGE",
	"LOAD_TIMEOUT",
	"METADATA_TIMEOUT",
	"PRERENDER_TIMEOUT",
]);

// ─── .env File Parser ────────────────────────────────────

/** Valid JS/TS identifier: starts with letter/underscore, then alphanumeric/underscore. */
const VALID_ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Process escape sequences in double-quoted values. */
function processEscapes(raw: string): string {
	return raw.replace(/\\(.)/g, (_, ch) => {
		switch (ch) {
			case "n":
				return "\n";
			case "r":
				return "\r";
			case "t":
				return "\t";
			case "\\":
				return "\\";
			case '"':
				return '"';
			default:
				return `\\${ch}`; // preserve unknown escapes
		}
	});
}

/** Parse a .env file content into key/value pairs. Skips comments and empty lines. */
function parseEnvFile(content: string, filename?: string): Record<string, string> {
	const result: Record<string, string> = {};
	const lines = content.split("\n");
	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eqIdx = trimmed.indexOf("=");
		if (eqIdx === -1) continue;
		const key = trimmed.slice(0, eqIdx).trim();
		if (!key) continue;

		// Validate key is a valid identifier (required for codegen)
		if (!VALID_ENV_NAME.test(key)) {
			const loc = filename ? ` in ${filename}` : "";
			throw new Error(
				`Invalid env variable name "${key}"${loc} (line ${i + 1}). ` +
					`Names must start with a letter or underscore and contain only [A-Za-z0-9_].`,
			);
		}

		let value = trimmed.slice(eqIdx + 1).trim();
		// Strip inline comments before quote-unescaping.
		// Quoted: find the real closing quote, verify trailing chars are whitespace+comment, truncate.
		// Unquoted: strip \s+#... (no space before # keeps foo#bar intact).
		if (value.startsWith('"')) {
			let end = -1;
			for (let j = 1; j < value.length; j++) {
				if (value[j] === "\\") {
					j++;
					continue;
				} // skip escaped char
				if (value[j] === '"') {
					end = j;
					break;
				}
			}
			if (end !== -1 && /^\s*(#.*)?$/.test(value.slice(end + 1))) {
				value = value.slice(0, end + 1);
			}
		} else if (value.startsWith("'")) {
			const end = value.indexOf("'", 1);
			if (end !== -1 && /^\s*(#.*)?$/.test(value.slice(end + 1))) {
				value = value.slice(0, end + 1);
			}
		} else {
			value = value.startsWith("#") ? "" : value.replace(/\s+#.*$/, "");
		}
		// Double-quoted: process escape sequences
		if (value.startsWith('"') && value.endsWith('"')) {
			value = processEscapes(value.slice(1, -1));
		}
		// Single-quoted: literal (no escape processing)
		else if (value.startsWith("'") && value.endsWith("'")) {
			value = value.slice(1, -1);
		}
		result[key] = value;
	}
	return result;
}

// ─── Env Loader ──────────────────────────────────────────

/**
 * Load .env files in order (later overrides earlier), then apply to process.env.
 * System env vars take highest precedence (never overwritten).
 *
 * Load order:
 *   1. .env
 *   2. .env.local
 *   3. .env.[mode]
 *   4. .env.[mode].local
 *
 * @param mode   "development" | "production"
 * @param dir    directory to look in (defaults to cwd)
 * @returns merged env record (only vars from .env files, excluding framework vars)
 */
export function loadEnv(mode: string, dir?: string): Record<string, string> {
	const root = dir ?? process.cwd();
	const files = [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`];

	let merged: Record<string, string> = {};
	const loaded: string[] = [];

	for (const filename of files) {
		const filepath = join(root, filename);
		if (!existsSync(filepath)) continue;
		const content = readFileSync(filepath, "utf-8");
		const parsed = parseEnvFile(content, filename);
		merged = { ...merged, ...parsed };
		loaded.push(filename);
	}

	if (loaded.length > 0) {
		console.log(`✓ Loaded ${loaded.join(", ")}`);
	}

	// Track declared keys so html.ts only exposes .env-declared PUBLIC_* vars
	for (const key of Object.keys(merged)) {
		_declaredKeys.add(key);
	}

	// Apply to process.env — system env wins (don't overwrite existing)
	for (const [key, value] of Object.entries(merged)) {
		if (!(key in process.env)) {
			process.env[key] = value;
		}
	}

	// Return only non-framework vars
	const result: Record<string, string> = {};
	for (const [key, value] of Object.entries(merged)) {
		if (!FRAMEWORK_VARS.has(key)) {
			result[key] = process.env[key] ?? value;
		}
	}

	return result;
}

// ─── Declared Key Tracking ───────────────────────────
// Track which keys were declared in .env files so html.ts only exposes those to the client.

const _declaredKeys = new Set<string>();

/** Returns the set of env var keys that were declared in .env files. */
export function getDeclaredEnvKeys(): ReadonlySet<string> {
	return _declaredKeys;
}

// ─── Classifier ──────────────────────────────────────────

export interface ClassifiedEnv {
	/** PUBLIC_STATIC_* — client+server, build-time inlined */
	publicStatic: Record<string, string>;
	/** PUBLIC_* (excluding PUBLIC_STATIC_*) — client+server, runtime */
	publicDynamic: Record<string, string>;
	/** STATIC_* — server only, build-time inlined */
	privateStatic: Record<string, string>;
	/** everything else — server only, runtime */
	privateDynamic: Record<string, string>;
}

/** Classify env vars by prefix into the four visibility/timing buckets. */
export function classifyEnvVars(env: Record<string, string>): ClassifiedEnv {
	const publicStatic: Record<string, string> = {};
	const publicDynamic: Record<string, string> = {};
	const privateStatic: Record<string, string> = {};
	const privateDynamic: Record<string, string> = {};

	for (const [key, value] of Object.entries(env)) {
		if (key.startsWith("PUBLIC_STATIC_")) {
			publicStatic[key] = value;
		} else if (key.startsWith("PUBLIC_")) {
			publicDynamic[key] = value;
		} else if (key.startsWith("STATIC_")) {
			privateStatic[key] = value;
		} else {
			privateDynamic[key] = value;
		}
	}

	return { publicStatic, publicDynamic, privateStatic, privateDynamic };
}
