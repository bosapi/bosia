import { scanRoutes } from "../core/scanner.ts";
import { generateRoutesFile } from "../core/routeFile.ts";
import { generateRouteTypes, ensureRootDirs } from "../core/routeTypes.ts";
import { loadEnv, classifyEnvVars } from "../core/env.ts";
import { generateEnvModules } from "../core/envCodegen.ts";

export async function runSync() {
	const envMode = process.env.NODE_ENV === "production" ? "production" : "development";
	const classifiedEnv = classifyEnvVars(loadEnv(envMode));
	const manifest = scanRoutes();
	generateRoutesFile(manifest);
	generateRouteTypes(manifest);
	ensureRootDirs();
	generateEnvModules(classifiedEnv);
	console.log("✅ Bosia codegen ready (.bosia/routes.ts, types, env modules)");
}
