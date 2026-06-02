import { join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";

// ─── bosia.json — committed install manifest ──────────────
// Records features/components/blocks installed via the CLI so
// `bosia feat list` and `bosia add list` can introspect project
// state. Lays the groundwork for uninstall (Phase 2).

export const MANIFEST_FILE = "bosia.json";
const MANIFEST_VERSION = 1;

export interface FeatureManifestEntry {
	installedAt: string;
	options?: Record<string, string>;
	files: { target: string; strategy: string; marker?: string }[];
	npmDeps?: string[];
	npmDevDeps?: string[];
	envVars?: string[];
	deps?: {
		features?: string[];
		components?: string[];
		blocks?: string[];
	};
}

export interface ComponentManifestEntry {
	installedAt: string;
	files: string[];
	npmDeps?: string[];
	dependencies?: string[];
}

export interface BlockManifestEntry {
	installedAt: string;
	files: string[];
	npmDeps?: string[];
	dependencies?: string[];
	fonts?: string[];
}

export interface Manifest {
	version: number;
	features: Record<string, FeatureManifestEntry>;
	components: Record<string, ComponentManifestEntry>;
	blocks: Record<string, BlockManifestEntry>;
}

function emptyManifest(): Manifest {
	return { version: MANIFEST_VERSION, features: {}, components: {}, blocks: {} };
}

export function readManifest(cwd: string = process.cwd()): Manifest {
	const path = join(cwd, MANIFEST_FILE);
	if (!existsSync(path)) return emptyManifest();
	try {
		const parsed = JSON.parse(readFileSync(path, "utf-8")) as Partial<Manifest>;
		return {
			version: parsed.version ?? MANIFEST_VERSION,
			features: parsed.features ?? {},
			components: parsed.components ?? {},
			blocks: parsed.blocks ?? {},
		};
	} catch {
		return emptyManifest();
	}
}

export function writeManifest(manifest: Manifest, cwd: string = process.cwd()): void {
	const path = join(cwd, MANIFEST_FILE);
	writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
}

export function recordFeature(
	cwd: string,
	name: string,
	entry: Omit<FeatureManifestEntry, "installedAt">,
): void {
	const manifest = readManifest(cwd);
	manifest.features[name] = { installedAt: new Date().toISOString(), ...entry };
	writeManifest(manifest, cwd);
}

export function recordComponent(
	cwd: string,
	fullPath: string,
	entry: Omit<ComponentManifestEntry, "installedAt">,
): void {
	const manifest = readManifest(cwd);
	manifest.components[fullPath] = { installedAt: new Date().toISOString(), ...entry };
	writeManifest(manifest, cwd);
}

export function recordBlock(
	cwd: string,
	name: string,
	entry: Omit<BlockManifestEntry, "installedAt">,
): void {
	const manifest = readManifest(cwd);
	manifest.blocks[name] = { installedAt: new Date().toISOString(), ...entry };
	writeManifest(manifest, cwd);
}
