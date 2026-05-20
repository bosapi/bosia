import { join } from "path";
import { existsSync } from "fs";
import { mergeFontImports } from "./fonts.ts";

// ─── bun x bosia@latest add font <family> <url> ─────────────
// Prepends a Google-Fonts-style `@import url(...)` to src/app.css
// with a `/* bosia-font: <family> */` marker so it's idempotent
// and survives Tailwind v4 / LightningCSS @import-ordering rules.
//
// Why a dedicated command: appending the @import at the bottom
// (or anywhere after `@import "tailwindcss"`) causes LightningCSS
// to silently drop the rule from public/bosia-tw.css. Hand-edits
// frequently get this wrong; this command always prepends.

export async function runAddFont(family: string | undefined, url: string | undefined) {
	if (!family || !url) {
		console.error(
			"❌ Please provide a font family and URL.\n" +
				'   Usage: bun x bosia@latest add font "<Family>" "<@import url>"\n' +
				'   Example: bun x bosia@latest add font "Fredoka" \\\n' +
				'            "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;700&display=swap"',
		);
		process.exit(1);
	}

	const cwd = process.cwd();
	const appCssPath = join(cwd, "src", "app.css");

	if (!existsSync(appCssPath)) {
		console.error(`❌ src/app.css not found at ${appCssPath}`);
		process.exit(1);
	}

	const added = mergeFontImports(appCssPath, { [family]: url });

	if (added.length === 0) {
		console.log(`⬡ Font already present: ${family} (no changes)`);
		return;
	}

	console.log(`✅ Added font: ${family}`);
	console.log(`   ✍️  src/app.css ← @import url("${url}");`);
	console.log("\n💡 Next: declare it on a token in src/app.css, e.g.");
	console.log('   @theme { --font-display: "' + family + '", sans-serif; }');
}
