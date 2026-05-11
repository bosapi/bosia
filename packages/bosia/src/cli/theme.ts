import { join } from "path";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { resolveLocalRegistryOrExit, readRegistryJSON, readRegistryFile } from "./registry.ts";
import { mergeFontImports } from "./fonts.ts";

// ─── bun x bosia@latest add theme <name> ─────────────────
// Installs a theme tokens.css to src/lib/themes/<name>.css and
// rewrites the active theme @import in src/app.css. One theme
// active at a time (v1 assumption).

interface ThemeMeta {
	name: string;
	description: string;
	files: string[];
	fonts?: Record<string, string>;
	npmDeps?: Record<string, string>;
}

const THEME_IMPORT_RE = /^@import\s+["']\.\/lib\/themes\/[^"']+["'];?\s*$/m;
const THEME_MARKER = "/* bosia-theme */";

export async function runAddTheme(name: string | undefined, flags: string[] = []) {
	if (!name) {
		console.error(
			"❌ Please provide a theme name.\n   Usage: bun x bosia@latest add theme <name> [--local]",
		);
		process.exit(1);
	}

	const local = flags.includes("--local");
	const registryRoot = local ? resolveLocalRegistryOrExit() : null;
	if (local) console.log(`⬡ Using local registry: ${registryRoot}\n`);

	console.log(`⬡ Installing theme: ${name}\n`);

	const meta = await readRegistryJSON<ThemeMeta>(registryRoot, "themes", name, "meta.json");

	const cwd = process.cwd();
	const themesDir = join(cwd, "src", "lib", "themes");
	mkdirSync(themesDir, { recursive: true });

	// Copy tokens.css (and any other files) to src/lib/themes/<name>.css
	// Convention: first file is the tokens file, written as <name>.css.
	const tokensFile = meta.files[0] ?? "tokens.css";
	const content = await readRegistryFile(registryRoot, "themes", name, tokensFile);
	const tokensDest = join(themesDir, `${name}.css`);
	writeFileSync(tokensDest, content, "utf-8");
	console.log(`   ✍️  src/lib/themes/${name}.css`);

	// Patch app.css: swap any existing ./lib/themes/*.css import for this one
	const appCssPath = join(cwd, "src", "app.css");
	if (existsSync(appCssPath)) {
		patchAppCssThemeImport(appCssPath, name);
		console.log(`   🎨 app.css → @import "./lib/themes/${name}.css"`);
	} else {
		console.warn(`   ⚠️  src/app.css not found — theme import not wired automatically.`);
	}

	// Font @imports
	if (meta.fonts && Object.keys(meta.fonts).length > 0 && existsSync(appCssPath)) {
		const added = mergeFontImports(appCssPath, meta.fonts);
		if (added.length > 0) console.log(`   🔤 Added fonts: ${added.join(", ")}`);
	}

	console.log(`\n✅ ${name} theme installed.`);
}

function patchAppCssThemeImport(appCssPath: string, themeName: string) {
	const src = readFileSync(appCssPath, "utf-8");
	const newImport = `${THEME_MARKER}\n@import "./lib/themes/${themeName}.css";`;

	let next: string;
	if (THEME_IMPORT_RE.test(src)) {
		next = src.replace(THEME_IMPORT_RE, `@import "./lib/themes/${themeName}.css";`);
		if (!next.includes(THEME_MARKER)) {
			next = next.replace(`@import "./lib/themes/${themeName}.css";`, newImport);
		}
	} else {
		// Insert after the tailwindcss @import line so @theme {} is processed correctly.
		const tw = /^(@import\s+["']tailwindcss["'];\s*\n)/m;
		if (tw.test(src)) {
			next = src.replace(tw, `$1${newImport}\n`);
		} else {
			next = `${newImport}\n${src}`;
		}
	}
	writeFileSync(appCssPath, next, "utf-8");
}
