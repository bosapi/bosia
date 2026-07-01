import { scanRoutes } from "../core/scanner.ts";
import { generateRoutesFile } from "../core/routeFile.ts";
import { generateRouteTypes, ensureRootDirs } from "../core/routeTypes.ts";
import { loadEnv, classifyEnvVars } from "../core/env.ts";
import { generateEnvModules } from "../core/envCodegen.ts";
import { findBrandPlaceholders, BRAND_SENTINEL } from "../core/brandGuard.ts";

export async function runSync() {
	const envMode = process.env.NODE_ENV === "production" ? "production" : "development";
	const classifiedEnv = classifyEnvVars(loadEnv(envMode));
	const manifest = scanRoutes();
	generateRoutesFile(manifest);
	generateRouteTypes(manifest);
	ensureRootDirs();
	generateEnvModules(classifiedEnv);
	console.log("✅ Bosia codegen ready (.bosia/routes.ts, types, env modules)");

	const brandHits = findBrandPlaceholders();
	if (brandHits.length > 0) {
		console.error(
			`\n❌ ${BRAND_SENTINEL} placeholder left un-replaced in ${brandHits.length} spot(s):`,
		);
		for (const { file, line } of brandHits) console.error(`  • ${file}:${line}`);
		console.error(`\nReplace ${BRAND_SENTINEL} with the app's name (nav/header/footer).\n`);
		process.exit(1);
	}
}
