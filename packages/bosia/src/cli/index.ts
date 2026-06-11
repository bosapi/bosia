#!/usr/bin/env bun
// ─── Bosia CLI ────────────────────────────────────────────
//   bun x bosia@latest create <name>   scaffold a new project
//   bun x bosia dev                       start the development server
//   bun x bosia build                     build for production
//   bun x bosia start                     run the production server
//   bun x bosia@latest add <name>         add a UI component from the registry
//   bun x bosia@latest feat <name>        add a feature scaffold from the registry

const [, , command, ...args] = process.argv;

async function main() {
	switch (command) {
		case "create": {
			// Name is the first non-flag token; --template consumes the next arg as its value
			// (also accepts --template=value form).
			let name: string | undefined;
			const rest: string[] = [];
			for (let i = 0; i < args.length; i++) {
				const a = args[i];
				if (a === "--template" && args[i + 1]) {
					rest.push(a, args[i + 1]);
					i++;
					continue;
				}
				if (!name && !a.startsWith("-")) {
					name = a;
					continue;
				}
				rest.push(a);
			}
			const { runCreate } = await import("./create.ts");
			await runCreate(name, rest);
			break;
		}
		case "dev": {
			const { runDev } = await import("./dev.ts");
			await runDev();
			break;
		}
		case "build": {
			const { runBuild } = await import("./build.ts");
			await runBuild();
			break;
		}
		case "sync": {
			const { runSync } = await import("./sync.ts");
			await runSync();
			break;
		}
		case "start": {
			const { runStart } = await import("./start.ts");
			await runStart();
			break;
		}
		case "test": {
			const { runTest } = await import("./test.ts");
			await runTest(args);
			break;
		}
		case "add": {
			const { routeAdd } = await import("./addRouter.ts");
			await routeAdd(args, {
				runAdd: async (names, flags) => {
					const { runAdd } = await import("./add.ts");
					await runAdd(names, flags);
				},
				runAddBlock: async (name, flags) => {
					const { runAddBlock } = await import("./block.ts");
					await runAddBlock(name, flags);
				},
				runAddTheme: async (name, flags) => {
					const { runAddTheme } = await import("./theme.ts");
					await runAddTheme(name, flags);
				},
				runAddFont: async (family, url) => {
					const { runAddFont } = await import("./font.ts");
					await runAddFont(family, url);
				},
				runAddList: async () => {
					const { runAddList } = await import("./add.ts");
					runAddList();
				},
			});
			break;
		}
		case "feat": {
			const nameIdx = args.findIndex((a) => !a.startsWith("-"));
			const featName = nameIdx === -1 ? undefined : args[nameIdx];
			if (featName === "list") {
				const { runFeatList } = await import("./feat.ts");
				runFeatList();
				break;
			}
			const { runFeat } = await import("./feat.ts");
			// First non-flag token is the feature name; everything else flows through to the
			// feature's own option parser. Global flags (-y, --local) are also accepted here
			// and get split out inside runFeat.
			const rest = nameIdx === -1 ? args : [...args.slice(0, nameIdx), ...args.slice(nameIdx + 1)];
			await runFeat(featName, rest);
			break;
		}
		default: {
			console.log(`
⬡ Bosia

Usage:
  bosia <command> [options]

Commands:
  create <name> [--template <t>]  Scaffold a new Bosia project
  dev                 Start the development server
  build               Build for production
  sync                Generate .bosia/ codegen (routes, $types, env) without building
  start               Run the production server
  test [args]         Run tests with bun test (auto-loads .env.test, sets BOSIA_ENV=test)
  add <component...> [-y]   Add one or more UI components from the registry
  add block <cat>/<name>    Add a composed block from the registry
  add theme <name>          Add a theme (tokens.css) from the registry
  add font <family> <url>   Prepend an @import url(...) for a font family to src/app.css
  add list                  List installed components and blocks (reads bosia.json)
  feat [-y] <feature> [feature options...]   Add a feature scaffold from the registry [--local]
                            -y / --yes auto-confirms prompts and uses each feature's default option values
                            Feature-specific options (e.g. file-upload's -d) follow the feature name
  feat list                 List installed features (reads bosia.json)

Examples:
  bun x bosia@latest create my-app
  bun x bosia@latest create my-app --template shop
  bun x bosia dev
  bun x bosia build
  bun x bosia start
  bun x bosia test
  bun x bosia test --watch
  bun x bosia test --coverage
  bun x bosia@latest add button              → src/lib/components/ui/button/
  bun x bosia@latest add button card input   → install multiple at once
  bun x bosia@latest add -y button card      → auto-confirm overwrites (CI / scripts)
  bun x bosia@latest add shop/cart           → src/lib/components/shop/cart/
  bun x bosia@latest add block cards/feature
  bun x bosia@latest add blocks/cards/feature   (alias for: add block cards/feature)
  bun x bosia@latest add theme editorial
  bun x bosia@latest add font "Fredoka" "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;700&display=swap"
  bun x bosia@latest feat login
  bun x bosia feat list
  bun x bosia add list
`);
			break;
		}
	}
}

main().catch((err) => {
	console.error("❌", err.message);
	process.exit(1);
});
