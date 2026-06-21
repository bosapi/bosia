import { resolve, join, basename, relative } from "path";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { spawn } from "bun";
import * as p from "@clack/prompts";
import { installFeature, initFeatRegistry, resolveLocalRegistry } from "./feat.ts";
import { initAddRegistry } from "./add.ts";

// ─── bun x bosia@latest create <name> [--template <name>] ─

const TEMPLATES_DIR = resolve(import.meta.dir, "../../templates");
const BOSIA_PKG = JSON.parse(readFileSync(resolve(import.meta.dir, "../../package.json"), "utf-8"));
const BOSIA_VERSION: string = BOSIA_PKG.version;

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
	default: "Minimal starter with routing and Tailwind",
	demo: "Full-featured demo with hooks, API routes, form actions, and more",
	shop: "Online store starter with auth, RBAC, S3 uploads, products/orders/cart",
	store: "Online store starter (Postgres + MinIO/S3) with auth, RBAC, products/orders/cart",
};

export async function runCreate(name: string | undefined, args: string[] = []) {
	if (!name) {
		console.error("❌ Please provide a project name.\n   Usage: bun x bosia@latest create my-app");
		process.exit(1);
	}

	const targetDir = resolve(process.cwd(), name);

	if (existsSync(targetDir)) {
		console.error(`❌ Directory already exists: ${targetDir}`);
		process.exit(1);
	}

	// Parse --template flag (supports `--template foo` and `--template=foo`)
	let template: string | undefined;
	const templateEq = args.find((a) => a.startsWith("--template="));
	if (templateEq) {
		template = templateEq.slice("--template=".length);
	} else {
		const templateIdx = args.indexOf("--template");
		if (templateIdx !== -1 && args[templateIdx + 1]) {
			template = args[templateIdx + 1];
		}
	}

	// Parse --local flag
	const isLocal = args.includes("--local");

	// Parse --no-install flag (skip final `bun install`)
	const skipInstall = args.includes("--no-install");

	// If no --template flag, prompt interactively
	if (!template) {
		template = await promptTemplate();
	}

	// Validate template exists
	const templateDir = resolve(TEMPLATES_DIR, template);
	if (!existsSync(templateDir)) {
		const available = getAvailableTemplates().join(", ");
		console.error(`❌ Unknown template: "${template}"\n   Available: ${available}`);
		process.exit(1);
	}

	console.log(`\n⬡ Creating Bosia project: ${basename(targetDir)} (template: ${template})\n`);

	const templateConfigPath = join(templateDir, "template.json");
	const config = existsSync(templateConfigPath)
		? JSON.parse(readFileSync(templateConfigPath, "utf-8"))
		: null;

	// Fast path: heavy templates marked `"prebuilt": true` ship a baked,
	// version-locked artifact on GitHub Releases. One download + extract beats
	// 150+ serial registry fetches. Skipped for `--local` (dev flow) and falls
	// back to the registry path if the artifact is missing (offline / no asset yet).
	// `BOSIA_BUILDING_PREBUILT` is set by the artifact generator so it scaffolds
	// via the registry instead of trying to download the asset it's producing.
	if (config?.prebuilt === true && !isLocal && !process.env.BOSIA_BUILDING_PREBUILT) {
		const ok = await scaffoldFromPrebuilt(template, targetDir, name);
		if (ok) {
			await finishCreate(targetDir, name, templateDir, skipInstall);
			return;
		}
		console.log("⚠️  Prebuilt artifact unavailable — installing from registry instead.\n");
	}

	copyDir(templateDir, targetDir, name, isLocal);

	if (existsSync(join(targetDir, ".env.example"))) {
		writeFileSync(join(targetDir, ".env"), readFileSync(join(targetDir, ".env.example"), "utf-8"));
	}

	// Install template features from registry
	if (config) {
		if (config.features?.length) {
			let localRegistry: string | null = null;
			try {
				localRegistry = resolveLocalRegistry();
			} catch {
				// Local registry not found — will use remote
			}

			await initAddRegistry(localRegistry);
			initFeatRegistry(localRegistry);

			const featureOptions: Record<string, string> = config.featureOptions ?? {};
			for (const feat of config.features) {
				await installFeature(feat, true, {
					skipInstall: true,
					skipPrompts: true,
					cwd: targetDir,
					featureOptions,
				});
			}
		}
	}

	await finishCreate(targetDir, name, templateDir, skipInstall);
}

// ─── Shared finish: optional `bun install` + printed instructions ──────────
async function finishCreate(
	targetDir: string,
	name: string,
	templateDir: string,
	skipInstall: boolean,
) {
	const printInstructions = () => {
		const instPath = join(templateDir, "instructions.txt");
		if (existsSync(instPath)) {
			const instructions = readFileSync(instPath, "utf-8").trimEnd();
			if (instructions) console.log(instructions);
		}
	};

	console.log(`\n✅ Project created at ${targetDir}\n`);

	if (skipInstall) {
		console.log(`Skipped \`bun install\` (--no-install).\n\ncd ${name} && bun install\n`);
		printInstructions();
		return;
	}

	console.log("Installing dependencies...");
	const proc = spawn(["bun", "install"], {
		stdout: "inherit",
		stderr: "inherit",
		cwd: targetDir,
	});
	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		console.warn("⚠️  bun install failed — run it manually.");
	} else {
		console.log(`\n🎉 Ready!\n\ncd ${name}`);
		printInstructions();
		console.log(`bun x bosia dev\n`);
	}
}

// ─── Prebuilt artifact fast path ──────────────────────────────────────────
// Downloads the version-locked `<template>.tar.gz` GitHub Release asset,
// extracts it into targetDir, then substitutes the `{{PROJECT_NAME}}`
// placeholder baked into the artifact. Returns false (caller falls back to the
// registry path) on any failure: 404, offline, or a corrupt archive.
async function scaffoldFromPrebuilt(
	template: string,
	targetDir: string,
	name: string,
): Promise<boolean> {
	const url = `https://github.com/bosapi/bosia/releases/download/v${BOSIA_VERSION}/${template}.tar.gz`;
	const tmpTar = join(tmpdir(), `bosia-${template}-${Date.now()}.tar.gz`);

	try {
		console.log(`⬇️  Downloading prebuilt template…`);
		const res = await fetch(url);
		if (!res.ok) return false;
		writeFileSync(tmpTar, Buffer.from(await res.arrayBuffer()));
	} catch {
		return false;
	}

	try {
		mkdirSync(targetDir, { recursive: true });
		const tar = spawn(["tar", "-xzf", tmpTar, "-C", targetDir], {
			stdout: "inherit",
			stderr: "inherit",
		});
		if ((await tar.exited) !== 0) return false;
	} catch {
		return false;
	} finally {
		try {
			unlinkSync(tmpTar);
		} catch {
			// best-effort cleanup
		}
	}

	substitutePlaceholder(targetDir, name);

	// Artifact bakes `.env` already, but restore from `.env.example` if missing.
	const envPath = join(targetDir, ".env");
	const envExample = join(targetDir, ".env.example");
	if (!existsSync(envPath) && existsSync(envExample)) {
		writeFileSync(envPath, readFileSync(envExample, "utf-8"));
	}

	return true;
}

// Replace the `{{PROJECT_NAME}}` placeholder (baked at generate-time) across
// every extracted file. Mirrors copyDir's utf-8 assumption — templates carry
// no binary files.
function substitutePlaceholder(dir: string, name: string) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			substitutePlaceholder(full, name);
		} else if (entry.isFile()) {
			const content = readFileSync(full, "utf-8");
			if (content.includes("{{PROJECT_NAME}}")) {
				writeFileSync(full, content.replaceAll("{{PROJECT_NAME}}", name), "utf-8");
			}
		}
	}
}

function getAvailableTemplates(): string[] {
	return readdirSync(TEMPLATES_DIR, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name)
		.sort((a, b) => (a === "default" ? -1 : b === "default" ? 1 : a.localeCompare(b)));
}

async function promptTemplate(): Promise<string> {
	const templates = getAvailableTemplates();

	if (templates.length === 1) return templates[0];

	const selected = await p.select({
		message: "Which template?",
		options: templates.map((t) => ({
			value: t,
			label: t,
			hint: TEMPLATE_DESCRIPTIONS[t],
		})),
	});

	if (p.isCancel(selected)) {
		p.cancel("Operation cancelled.");
		process.exit(0);
	}

	return selected as string;
}

function copyDir(src: string, dest: string, projectName: string, isLocal: boolean) {
	mkdirSync(dest, { recursive: true });
	for (const entry of readdirSync(src, { withFileTypes: true })) {
		const srcPath = join(src, entry.name);
		// npm pack strips `.gitignore` from published packages, so templates ship
		// it as `_gitignore` and we restore the dotfile name on copy.
		const destName = entry.name === "_gitignore" ? ".gitignore" : entry.name;
		const destPath = join(dest, destName);

		// Do not copy instructions.txt or template.json to the final project
		if (entry.name === "instructions.txt" || entry.name === "template.json") continue;

		if (entry.isDirectory()) {
			copyDir(srcPath, destPath, projectName, isLocal);
		} else {
			let content = readFileSync(srcPath, "utf-8").replaceAll("{{PROJECT_NAME}}", projectName);

			if (entry.name === "package.json" && isLocal) {
				const bosiaPath = resolve(import.meta.dir, "../../");
				const relPath = relative(dest, bosiaPath);
				content = content.replaceAll('"^{{BOSIA_VERSION}}"', `"file:${relPath}"`);
			} else {
				content = content.replaceAll("{{BOSIA_VERSION}}", BOSIA_VERSION);
			}

			writeFileSync(destPath, content, "utf-8");
		}
	}
}
