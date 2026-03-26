#!/usr/bin/env bun
// ─── Bosia CLI ────────────────────────────────────────────
//   bosia create <name>   scaffold a new project
//   bosia dev             start the development server
//   bosia build           build for production
//   bosia start           run the production server
//   bosia add <name>      add a UI component from the registry
//   bosia feat <name>     add a feature scaffold from the registry

const [, , command, ...args] = process.argv;

async function main() {
    switch (command) {
        case "create": {
            const { runCreate } = await import("./create.ts");
            await runCreate(args[0], args.slice(1));
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
        case "start": {
            const { runStart } = await import("./start.ts");
            await runStart();
            break;
        }
        case "add": {
            const { runAdd } = await import("./add.ts");
            await runAdd(args[0]);
            break;
        }
        case "feat": {
            const { runFeat } = await import("./feat.ts");
            await runFeat(args[0]);
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
  start               Run the production server
  add <component>     Add a UI component from the registry
  feat <feature>      Add a feature scaffold from the registry

Examples:
  bosia create my-app
  bosia create my-app --template demo
  bosia dev
  bosia build
  bosia start
  bosia add button
  bosia feat login
`);
            break;
        }
    }
}

main().catch((err) => {
    console.error("❌", err.message);
    process.exit(1);
});
