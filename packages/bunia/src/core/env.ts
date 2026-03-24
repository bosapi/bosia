import { existsSync, readFileSync } from "fs";
import { join } from "path";

// ─── Framework-reserved vars ─────────────────────────────
// These are controlled by Bunia itself — users access them via process.env directly.
const FRAMEWORK_VARS = new Set([
    "PORT",
    "NODE_ENV",
    "BODY_SIZE_LIMIT",
    "CSRF_ALLOWED_ORIGINS",
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

/** Parse a .env file content into key/value pairs. Skips comments and empty lines. */
function parseEnvFile(content: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        // Strip surrounding quotes (single or double)
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (key) result[key] = value;
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
    const files = [
        ".env",
        ".env.local",
        `.env.${mode}`,
        `.env.${mode}.local`,
    ];

    let merged: Record<string, string> = {};
    const loaded: string[] = [];

    for (const filename of files) {
        const filepath = join(root, filename);
        if (!existsSync(filepath)) continue;
        const content = readFileSync(filepath, "utf-8");
        const parsed = parseEnvFile(content);
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
