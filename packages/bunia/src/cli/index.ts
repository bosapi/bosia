#!/usr/bin/env bun
// ─── Bunia CLI ────────────────────────────────────────────
//   bunia create <name>   scaffold a new project
//   bunia dev             start the development server
//   bunia build           build for production
//   bunia add <name>      add a UI component from the registry
//   bunia feat <name>     add a feature scaffold from the registry

const [, , command, ...args] = process.argv;

async function main() {
    switch (command) {
        case "create": {
            const { runCreate } = await import("./create.ts");
            await runCreate(args[0]);
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
🐰 Bunia

Usage:
  bunia <command> [options]

Commands:
  create <name>       Scaffold a new Bunia project
  dev                 Start the development server
  build               Build for production
  add <component>     Add a UI component from the registry
  feat <feature>      Add a feature scaffold from the registry

Examples:
  bunia create my-app
  bunia dev
  bunia build
  bunia add button
  bunia feat login
`);
            break;
        }
    }
}

main().catch((err) => {
    console.error("❌", err.message);
    process.exit(1);
});
