import { join, resolve as resolvePath } from "path";

/**
 * Resolve `untrusted` relative to `base` and verify the result stays inside
 * `base`. Returns the absolute resolved path on success, or `null` when the
 * resolved location escapes the base directory (traversal, absolute path
 * pointing elsewhere, etc.). Use this on every untrusted path segment before
 * touching the filesystem.
 */
export function safePath(base: string, untrusted: string): string | null {
	const root = resolvePath(base);
	const full = resolvePath(join(base, untrusted));
	return full.startsWith(root + "/") || full === root ? full : null;
}
