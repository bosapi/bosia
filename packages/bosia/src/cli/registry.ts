import { join, dirname, resolve as resolvePath } from "path";
import { writeFileSync, readFileSync, existsSync, unlinkSync, mkdirSync } from "fs";
import { spawn } from "bun";

import { safePath } from "../core/safePath.ts";

// ─── Shared registry utilities for feat.ts and add.ts ─────

export const REGISTRY_URL = "https://raw.githubusercontent.com/bosapi/bosia/main/registry";

export interface InstallOptions {
	skipInstall?: boolean; // write deps to package.json instead of `bun add`
	skipPrompts?: boolean; // auto-overwrite, no interactive prompts
	cwd?: string; // override process.cwd() for file operations
	/** When set, use this absolute path as the local registry root instead of fetching from GitHub. */
	registryRoot?: string | null;
	/** Pre-resolved feature-specific option values, keyed by `featureName.optionName`. */
	featureOptions?: Record<string, string>;
	/** Remaining argv tokens to be parsed as the root feature's own options. */
	featureArgs?: string[];
}

// ─── Local registry resolution ────────────────────────────

export function resolveLocalRegistry(): string {
	let dir = import.meta.dir;
	for (let i = 0; i < 10; i++) {
		const candidate = join(dir, "registry");
		if (existsSync(join(candidate, "index.json"))) return candidate;
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	throw new Error("Could not find local registry/ directory.");
}

/** Resolve local registry, exiting with error message on failure. For CLI entry points. */
export function resolveLocalRegistryOrExit(): string {
	try {
		return resolveLocalRegistry();
	} catch {
		console.error("❌ Could not find local registry/ directory.");
		process.exit(1);
	}
}

// ─── Path containment ─────────────────────────────────────

/**
 * Resolve `rel` (a name or path taken from registry metadata or the command
 * line) under `base`, and throw if it lands outside it. Registry `meta.json`
 * decides where files go, so a `../` in it must not write over `~/.bashrc`.
 *
 * Backslashes are refused outright: on Linux and macOS `..\x` is one plain
 * filename and would pass the check, but `fetch()` reads `\` as `/` when the
 * same string goes into a registry URL. No registry entry uses one.
 */
export function containedPath(base: string, rel: string): string {
	if (rel.includes("\\")) {
		throw new Error(`Refusing to use "${rel}": registry paths use "/", not "\\"`);
	}
	const full = safePath(base, rel);
	if (!full || full === resolvePath(base)) {
		throw new Error(`Refusing to use "${rel}": it resolves outside ${base}`);
	}
	return full;
}

// ─── Registry file readers ────────────────────────────────

/**
 * Where a registry file comes from: a path under the local registry's category
 * folder, or a URL under the remote one. Throws when `name`/`file` would leave
 * that folder.
 *
 * The remote case is checked as a URL, because a URL is what gets fetched. The
 * URL parser reads `%2e%2e` as `..` (a path check sees a plain folder name), and
 * `?` or `#` would cut the path short, so all three are refused, and the parsed
 * pathname must still sit under the category.
 */
export function registrySource(
	registryRoot: string | null,
	category: string,
	name: string,
	file: string,
): string {
	const rel = `${name}/${file}`;
	if (registryRoot) return containedPath(join(registryRoot, category), rel);

	if (/[%?#]/.test(rel)) {
		throw new Error(`Refusing to use "${rel}": registry paths can't contain "%", "?" or "#"`);
	}
	containedPath(category, rel);
	const base = new URL(`${REGISTRY_URL}/${category}/`);
	const url = new URL(rel, base);
	if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
		throw new Error(`Refusing to use "${rel}": it resolves outside ${base.href}`);
	}
	return url.href;
}

/** Read and parse a JSON file from the registry (local or remote). */
export async function readRegistryJSON<T>(
	registryRoot: string | null,
	category: string,
	name: string,
	file: string,
): Promise<T> {
	const source = registrySource(registryRoot, category, name, file);
	if (!registryRoot) return fetchJSON<T>(source);
	if (!existsSync(source)) {
		throw new Error(`"${file}" not found for ${category.slice(0, -1)} "${name}" in local registry`);
	}
	return JSON.parse(readFileSync(source, "utf-8"));
}

/** Read a text file from the registry (local or remote). */
export async function readRegistryFile(
	registryRoot: string | null,
	category: string,
	name: string,
	file: string,
): Promise<string> {
	const source = registrySource(registryRoot, category, name, file);
	if (!registryRoot) return fetchText(source);
	if (!existsSync(source)) {
		throw new Error(
			`File "${file}" not found for ${category.slice(0, -1)} "${name}" in local registry`,
		);
	}
	return readFileSync(source, "utf-8");
}

// ─── Registry file installer ──────────────────────────────

/**
 * Check every source and destination path of a registry item without reading
 * or writing anything. Installers call this right after reading `meta.json`,
 * before installing any dependency, so a bad path stops the install before
 * anything is written. Returns the checked destinations, in `files` order.
 */
export function checkRegistryFiles(
	registryRoot: string | null,
	category: string,
	name: string,
	files: string[],
	destDir: string,
): string[] {
	return files.map((file) => {
		registrySource(registryRoot, category, name, file);
		return containedPath(destDir, file);
	});
}

/**
 * Copy a registry item's `files` into `destDir`. Every path is checked and
 * every file read (in parallel) before the first write, so a rejected path or a
 * failed download leaves nothing half-installed. `label` is the project-relative
 * `destDir` used in the log lines.
 */
export async function installRegistryFiles(
	registryRoot: string | null,
	category: string,
	name: string,
	files: string[],
	destDir: string,
	label: string,
): Promise<void> {
	const dests = checkRegistryFiles(registryRoot, category, name, files, destDir);
	const contents = await Promise.all(
		files.map((file) => readRegistryFile(registryRoot, category, name, file)),
	);

	mkdirSync(destDir, { recursive: true });
	files.forEach((file, i) => {
		if (file.includes("/")) mkdirSync(dirname(dests[i]!), { recursive: true });
		writeRegistryFile(dests[i]!, contents[i]!);
		console.log(`   ✍️  ${label}/${file}`);
	});
}

// ─── Registry file writer ─────────────────────────────────

/**
 * Write a registry file with one EACCES/EPERM recovery attempt.
 *
 * Component/block file loops abort mid-install when a target path is owned by a
 * different uid — bosapi tenant apps run sandboxed as `bosapi-app-N`, so a
 * subsequent install from the bosapi user hits EACCES on the first foreign-owned
 * file and leaves a partial install behind. Unlink + retry recovers; only the
 * unrecoverable case surfaces the chown hint.
 */
export function writeRegistryFile(dest: string, content: string): void {
	try {
		writeFileSync(dest, content, "utf-8");
		return;
	} catch (err) {
		const code = (err as NodeJS.ErrnoException).code;
		if (code !== "EACCES" && code !== "EPERM") throw err;
	}
	try {
		unlinkSync(dest);
	} catch {
		// ignore — retry will surface the real error
	}
	try {
		writeFileSync(dest, content, "utf-8");
	} catch (retry) {
		const e = retry as NodeJS.ErrnoException;
		throw new Error(
			`Cannot write ${dest}: ${e.code}. ` +
				`The existing file is owned by a different user (likely created from inside ` +
				`the app sandbox). Fix from the project root: chown -R $(whoami) src/lib`,
		);
	}
}

// ─── package.json helpers ─────────────────────────────────

export interface PkgDeps {
	deps?: Record<string, string>;
	devDeps?: Record<string, string>;
	scripts?: Record<string, string>;
}

/**
 * Merge dependencies and scripts into package.json in a single read/write.
 * Returns the list of added keys, or empty arrays if nothing changed.
 */
export function mergePkgJson(
	cwd: string,
	changes: PkgDeps,
): { addedDeps: string[]; addedScripts: string[] } {
	const pkgPath = join(cwd, "package.json");
	if (!existsSync(pkgPath)) return { addedDeps: [], addedScripts: [] };

	const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
	let changed = false;
	const addedDeps: string[] = [];
	const addedScripts: string[] = [];

	if (changes.deps && Object.keys(changes.deps).length > 0) {
		pkg.dependencies = pkg.dependencies ?? {};
		for (const [name, ver] of Object.entries(changes.deps)) {
			if (!pkg.dependencies[name]) {
				pkg.dependencies[name] = ver;
				addedDeps.push(name);
				changed = true;
			}
		}
	}

	if (changes.devDeps && Object.keys(changes.devDeps).length > 0) {
		pkg.devDependencies = pkg.devDependencies ?? {};
		for (const [name, ver] of Object.entries(changes.devDeps)) {
			if (!pkg.devDependencies[name]) {
				pkg.devDependencies[name] = ver;
				addedDeps.push(name);
				changed = true;
			}
		}
	}

	if (changes.scripts && Object.keys(changes.scripts).length > 0) {
		pkg.scripts = pkg.scripts ?? {};
		for (const [key, val] of Object.entries(changes.scripts)) {
			if (!pkg.scripts[key]) {
				pkg.scripts[key] = val;
				addedScripts.push(key);
				changed = true;
			}
		}
	}

	if (changed) {
		writeFileSync(pkgPath, JSON.stringify(pkg, null, "\t") + "\n", "utf-8");
	}

	return { addedDeps, addedScripts };
}

/** Run `bun add` for deps and optionally `bun add --dev` for devDeps. */
export async function bunAdd(
	cwd: string,
	deps: Record<string, string>,
	devDeps?: Record<string, string>,
): Promise<void> {
	const packages = Object.entries(deps).map(([pkg, ver]) => (ver ? `${pkg}@${ver}` : pkg));
	if (packages.length > 0) {
		console.log(`\n📥 npm: ${packages.join(", ")}`);
		const proc = spawn(["bun", "add", ...packages], {
			stdout: "inherit",
			stderr: "inherit",
			cwd,
		});
		if ((await proc.exited) !== 0) {
			console.warn(`⚠️  bun add failed for: ${packages.join(", ")}`);
		}
	}
	const devPackages = Object.entries(devDeps ?? {}).map(([pkg, ver]) =>
		ver ? `${pkg}@${ver}` : pkg,
	);
	if (devPackages.length > 0) {
		console.log(`\n📥 npm (dev): ${devPackages.join(", ")}`);
		const proc = spawn(["bun", "add", "--dev", ...devPackages], {
			stdout: "inherit",
			stderr: "inherit",
			cwd,
		});
		if ((await proc.exited) !== 0) {
			console.warn(`⚠️  bun add --dev failed for: ${devPackages.join(", ")}`);
		}
	}
}

// ─── HTTP helpers ─────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
	return res.json() as Promise<T>;
}

async function fetchText(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
	return res.text();
}
