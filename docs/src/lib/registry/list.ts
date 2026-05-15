import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import matter from "gray-matter";

export type RegistryKind = "components" | "blocks";

export type RegistrySummary = {
	name: string;
	path: string;
	description: string;
	install?: string;
	dependencies?: string[];
	category?: string;
};

export type RegistryDetail = RegistrySummary & { mdFile: string };

const DOCS_ROOT = resolve(process.cwd(), "content", "docs");
const REGISTRY_ROOT = resolve(process.cwd(), "..", "registry");

const PATH_RE = /^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/;

function docsDirFor(kind: RegistryKind): string {
	return join(DOCS_ROOT, kind);
}

async function scanMdFiles(dir: string, prefix: string): Promise<{ path: string; raw: string }[]> {
	let entries: Dirent[];
	try {
		entries = (await readdir(dir, { withFileTypes: true })) as Dirent[];
	} catch {
		return [];
	}
	const out: { path: string; raw: string }[] = [];
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			out.push(...(await scanMdFiles(full, prefix ? `${prefix}/${entry.name}` : entry.name)));
		} else if (entry.isFile() && entry.name.endsWith(".md")) {
			const base = entry.name.replace(/\.md$/, "");
			const path = prefix ? `${prefix}/${base}` : base;
			out.push({ path, raw: await readFile(full, "utf8") });
		}
	}
	return out;
}

type RegistryMeta = {
	name?: unknown;
	description?: unknown;
	dependencies?: unknown;
	category?: unknown;
};

async function readRegistryMeta(kind: RegistryKind, path: string): Promise<RegistryMeta | null> {
	const file = join(REGISTRY_ROOT, kind, path, "meta.json");
	try {
		return JSON.parse(await readFile(file, "utf8")) as RegistryMeta;
	} catch {
		return null;
	}
}

function deriveName(data: Record<string, unknown>, path: string): string {
	const title = data.title;
	if (typeof title === "string") {
		const single = title.trim().toLowerCase().split(/\s+/)[0];
		if (single && /^[a-z0-9-]+$/.test(single)) return single;
	}
	const segments = path.split("/");
	return segments[segments.length - 1];
}

function buildSummary(
	kind: RegistryKind,
	path: string,
	raw: string,
	meta: RegistryMeta | null,
): { summary: RegistrySummary; content: string } {
	const { data, content } = matter(raw);
	const name = deriveName(data, path);
	const description = typeof data.description === "string" ? data.description : "";
	const summary: RegistrySummary = { name, path, description };

	if (meta) {
		const metaName = typeof meta.name === "string" ? meta.name : name;
		summary.install =
			kind === "components"
				? `bun x bosia@latest add ${metaName}`
				: `bun x bosia@latest add block ${path}`;
		if (Array.isArray(meta.dependencies)) {
			summary.dependencies = meta.dependencies.filter(
				(d): d is string => typeof d === "string",
			);
		}
	}

	if (kind === "components") {
		const segments = path.split("/");
		if (segments.length > 1) summary.category = segments[0];
	} else if (meta && typeof meta.category === "string") {
		summary.category = meta.category;
	}

	return { summary, content };
}

export async function listRegistry(kind: RegistryKind): Promise<RegistrySummary[]> {
	const details = await listRegistryWithContent(kind);
	return details.map(({ mdFile: _mdFile, ...summary }) => summary);
}

export async function listRegistryWithContent(kind: RegistryKind): Promise<RegistryDetail[]> {
	const files = await scanMdFiles(docsDirFor(kind), "");
	const details: RegistryDetail[] = [];
	for (const { path, raw } of files) {
		if (path === "overview") continue;
		const meta = await readRegistryMeta(kind, path);
		const { summary, content } = buildSummary(kind, path, raw, meta);
		details.push({ ...summary, mdFile: content });
	}
	details.sort((a, b) => a.path.localeCompare(b.path));
	return details;
}

export async function getRegistryDetail(
	kind: RegistryKind,
	path: string,
): Promise<RegistryDetail | null> {
	if (!PATH_RE.test(path)) return null;
	const file = join(docsDirFor(kind), `${path}.md`);
	let raw: string;
	try {
		raw = await readFile(file, "utf8");
	} catch {
		return null;
	}
	const meta = await readRegistryMeta(kind, path);
	const { summary, content } = buildSummary(kind, path, raw, meta);
	return { ...summary, mdFile: content };
}
