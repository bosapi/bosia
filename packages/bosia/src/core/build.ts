import { writeFileSync, rmSync, mkdirSync } from "fs";
import { join, relative } from "path";

import { scanRoutes } from "./scanner.ts";
import { generateRoutesFile } from "./routeFile.ts";
import { generateRouteTypes, ensureRootDirs } from "./routeTypes.ts";
import { makeBosiaPlugin } from "./plugin.ts";
import { makeBosiaSvelteCompiler, svelteMapCache } from "./svelteCompiler.ts";
import { prerenderStaticRoutes, generateStaticSite } from "./prerender.ts";
import { loadEnv, classifyEnvVars } from "./env.ts";
import { generateEnvModules } from "./envCodegen.ts";
import { BOSIA_NODE_PATH, OUT_DIR, resolveBosiaBin } from "./paths.ts";
import { loadPlugins } from "./config.ts";
import type { BuildContext } from "./types/plugin.ts";
import { loadAppHtmlTemplate } from "./appHtml.ts";

// Resolved from this file's location inside the bosia package
const CORE_DIR = import.meta.dir;

// ─── Entry Point ─────────────────────────────────────────

const isProduction = process.env.NODE_ENV === "production";

const buildStart = performance.now();
console.log("🏗️  Starting Bosia build...\n");

// 0. Load plugins from bosia.config.ts
const userPlugins = await loadPlugins(process.cwd());
if (userPlugins.length > 0) {
	console.log(`🔌 Plugins: ${userPlugins.map((p) => p.name).join(", ")}`);
}

const buildCtx: BuildContext = {
	mode: isProduction ? "production" : "development",
	cwd: process.cwd(),
};

for (const p of userPlugins) {
	if (p.build?.preBuild) {
		await p.build.preBuild(buildCtx);
	}
}

// 0a. Load .env files (before cleaning .bosia so loadEnv can set process.env early)
const envMode = isProduction ? "production" : "development";
const envVars = loadEnv(envMode);
const classifiedEnv = classifyEnvVars(envVars);

// 0b. Clean generated output. Only OUT_DIR (this build's artifacts) and the
// codegen files inside .bosia/ that this build owns. A blanket wipe of .bosia/
// would clobber a concurrently-running `bosia dev` whose compiled server lives
// at .bosia/dev/ — the codegen files (routes*.ts, env.*.ts, types/) are the
// only things this build needs to clear to avoid stale entries on route renames.
try {
	rmSync(OUT_DIR, { recursive: true, force: true });
} catch {}
for (const p of [
	".bosia/routes.ts",
	".bosia/routes.client.ts",
	".bosia/env.server.ts",
	".bosia/env.client.ts",
	".bosia/types",
]) {
	try {
		rmSync(p, { recursive: true, force: true });
	} catch {}
}

// 1. Scan routes
const manifest = scanRoutes();
buildCtx.manifest = manifest;
console.log(`📂 Found ${manifest.pages.length} page route(s):`);
for (const r of manifest.pages) {
	console.log(`   ${r.pattern} → ${r.page}${r.pageServer ? " (server)" : ""}`);
}
if (manifest.apis.length > 0) {
	console.log(`📡 Found ${manifest.apis.length} API route(s):`);
	for (const r of manifest.apis) {
		console.log(`   ${r.pattern} → ${r.server}`);
	}
}

// 1b. Load & validate src/app.html template (required)
let appHtml: any;
try {
	appHtml = loadAppHtmlTemplate(process.cwd());
	console.log(
		"📄 Loaded src/app.html (favicon override: " +
			(appHtml.hasCustomFavicon ? "yes" : "no") +
			")",
	);
} catch (err) {
	console.error(`❌ src/app.html validation failed:\n${(err as Error).message}`);
	process.exit(1);
}

for (const p of userPlugins) {
	if (p.build?.postScan) {
		await p.build.postScan(manifest, buildCtx);
	}
}

// 2. Generate .bosia/routes.ts (single file replaces all old code generators)
generateRoutesFile(manifest);

// 2b. Generate .bosia/types/src/routes/**/$types.d.ts for IDE type inference
generateRouteTypes(manifest);

// 2c. Ensure tsconfig.json has rootDirs pointing at .bosia/types
ensureRootDirs();

// 2d. Generate .bosia/env.server.ts, .bosia/env.client.ts, .bosia/types/env.d.ts
generateEnvModules(classifiedEnv);

// 3. Start Tailwind CSS (async — runs concurrently with client+server builds)
const tailwindBin = resolveBosiaBin("tailwindcss");
const tailwindProc = Bun.spawn(
	[
		tailwindBin,
		"-i",
		"./src/app.css",
		"-o",
		"./public/bosia-tw.css",
		...(isProduction ? ["--minify"] : []),
	],
	{
		cwd: process.cwd(),
		env: { ...process.env, NODE_PATH: BOSIA_NODE_PATH },
		stderr: "pipe",
	},
);
const tailwindPromise = tailwindProc.exited;

// Separate plugin instances per build target ($env resolves differently)
const clientPlugin = makeBosiaPlugin("browser");
const serverPlugin = makeBosiaPlugin("bun");

// Collect Bun build plugins contributed by user plugins, per target.
const userClientBunPlugins = userPlugins.flatMap((p) => p.build?.bunPlugins?.("browser") ?? []);
const userServerBunPlugins = userPlugins.flatMap((p) => p.build?.bunPlugins?.("bun") ?? []);

// Build-time defines: inline PUBLIC_STATIC_* and STATIC_* vars
const staticDefines: Record<string, string> = {};
for (const [key, value] of Object.entries(classifiedEnv.publicStatic)) {
	staticDefines[`import.meta.env.${key}`] = JSON.stringify(value);
}
for (const [key, value] of Object.entries(classifiedEnv.privateStatic)) {
	staticDefines[`import.meta.env.${key}`] = JSON.stringify(value);
}

// 5. Build Tailwind + client + server bundles in parallel
console.log("\n📦 Building Tailwind + client + server...");
const clientPromise = Bun.build({
	entrypoints: [join(CORE_DIR, "client", "hydrate.ts")],
	outdir: `${OUT_DIR}/client`,
	target: "browser",
	splitting: true,
	naming: { chunk: "[name]-[hash].[ext]" },
	minify: isProduction,
	sourcemap: isProduction ? "none" : "linked",
	define: {
		"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
		...staticDefines,
	},
	plugins: [clientPlugin, ...userClientBunPlugins, makeBosiaSvelteCompiler("browser")],
});

const serverPromise = Bun.build({
	entrypoints: [join(CORE_DIR, "server.ts")],
	outdir: `${OUT_DIR}/server`,
	target: "bun",
	splitting: true,
	naming: { entry: "index.[ext]", chunk: "[name]-[hash].[ext]" },
	minify: isProduction,
	sourcemap: isProduction ? "none" : "linked",
	external: ["elysia"],
	plugins: [serverPlugin, ...userServerBunPlugins, makeBosiaSvelteCompiler("bun")],
});

const [tailwindExitCode, clientResult, serverResult] = await Promise.all([
	tailwindPromise,
	clientPromise,
	serverPromise,
]);

if (tailwindExitCode !== 0) {
	const stderr = await new Response(tailwindProc.stderr).text();
	console.error("❌ Tailwind CSS build failed:\n" + stderr);
	process.exit(1);
}
console.log("✅ Tailwind CSS built: public/bosia-tw.css");

if (!clientResult.success) {
	console.error("❌ Client build failed:");
	for (const msg of clientResult.logs) console.error(msg);
	process.exit(1);
}

if (!serverResult.success) {
	console.error("❌ Server build failed:");
	for (const msg of serverResult.logs) console.error(msg);
	process.exit(1);
}

// Persist the per-file Svelte compile maps so the inspector's runtime stack
// resolver can chain bundle-map → svelte-map to land on original source. We
// cannot chain at bundle time because Bun's bundle maps reference intermediate
// JS positions that are mostly absent from Svelte's sparse compile map —
// post-build remapping nukes mappings. Instead we keep both maps separate and
// do a two-stage lookup with `bias` interpolation in the resolver.
if (!isProduction && svelteMapCache.size > 0) {
	const entries: Record<string, unknown> = {};
	for (const [k, v] of svelteMapCache) entries[k] = v;
	writeFileSync(`${OUT_DIR}/svelte-maps.json`, JSON.stringify(entries));
}

// 6. Collect output files for dist/manifest.json
const jsFiles: string[] = [];
const cssFiles: string[] = [];
for (const output of clientResult.outputs) {
	const rel = relative(`${OUT_DIR}/client`, output.path);
	if (output.path.endsWith(".js")) jsFiles.push(rel);
	if (output.path.endsWith(".css")) cssFiles.push(rel);
}

// Entry is always "index.js" due to naming: { entry: "index.[ext]" }
const serverEntry =
	serverResult.outputs
		.find((o) => o.path.endsWith("index.js"))
		?.path.split("/")
		.pop() ?? "index.js";

// 8. Write dist/manifest.json
mkdirSync(OUT_DIR, { recursive: true });
const distManifest = {
	js: jsFiles,
	css: cssFiles,
	entry:
		jsFiles.find((f) => f === "hydrate.js") ??
		jsFiles.find((f) => f.startsWith("hydrate")) ??
		"hydrate.js",
	serverEntry,
};
writeFileSync(`${OUT_DIR}/manifest.json`, JSON.stringify(distManifest, null, 2));
console.log(`✅ Client bundle: ${jsFiles.join(", ")}`);
console.log(`✅ Server entry:  ${OUT_DIR}/server/${serverEntry}`);

// 8b. Persist route manifest for runtime plugins (backend.after consumers like OpenAPI).
writeFileSync(`${OUT_DIR}/route-manifest.json`, JSON.stringify(manifest, null, 2));

// 9. Prerender static routes
await prerenderStaticRoutes(manifest);

// 10. Generate static site output (HTML + client assets + public → dist/static/)
generateStaticSite();

for (const p of userPlugins) {
	if (p.build?.postBuild) {
		await p.build.postBuild(buildCtx);
	}
}

console.log(`\n🎉 Build complete in ${Math.round(performance.now() - buildStart)}ms!`);
