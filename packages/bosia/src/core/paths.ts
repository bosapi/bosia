import { join, dirname } from "path";
import { existsSync } from "fs";

// This file lives at src/core/paths.ts → package root is ../..
const BOSIA_PKG_DIR = join(import.meta.dir, "..", "..");

// Bun hoists dependencies flat, so bosia's deps may live in the parent
// node_modules rather than a nested node_modules/bosia/node_modules.
const NESTED_NM = join(BOSIA_PKG_DIR, "node_modules");

// When installed as a dep (node_modules/bosia/), parent is node_modules/ itself.
// Only include it if the package is actually inside a node_modules directory
// AND the parent node_modules contains real (resolvable) packages.
const parentDir = dirname(BOSIA_PKG_DIR); // node_modules/ when installed, packages/ in workspace
const isInstalledAsDep = parentDir.endsWith("node_modules");
const HOISTED_NM = isInstalledAsDep ? parentDir : null;

/** NODE_PATH value covering both nested and hoisted dependency locations */
export const BOSIA_NODE_PATH = HOISTED_NM
    ? [NESTED_NM, HOISTED_NM].join(":")
    : NESTED_NM;

/** Find a binary from bosia's dependencies (handles hoisting) */
export function resolveBosiaBin(name: string): string {
    const nested = join(NESTED_NM, ".bin", name);
    if (existsSync(nested)) return nested;
    if (HOISTED_NM) {
        const hoisted = join(HOISTED_NM, ".bin", name);
        if (existsSync(hoisted)) return hoisted;
    }
    return nested; // fallback — will produce a clear ENOENT
}
