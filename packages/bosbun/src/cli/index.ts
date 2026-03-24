#!/usr/bin/env bun
// ─── Bosbun CLI ────────────────────────────────────────────
//   bosbun create <name>   scaffold a new project
//   bosbun dev             start the development server
//   bosbun build           build for production
//   bosbun start           run the production server
//   bosbun add <name>      add a UI component from the registry
//   bosbun feat <name>     add a feature scaffold from the registry

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
🐰 Bosbun

Usage:
  bosbun <command> [options]

Commands:
  create <name>       Scaffold a new Bosbun project
  dev                 Start the development server
  build               Build for production
  start               Run the production server
  add <component>     Add a UI component from the registry
  feat <feature>      Add a feature scaffold from the registry

Examples:
  bosbun create my-app
  bosbun dev
  bosbun build
  bosbun start
  bosbun add button
  bosbun feat login
`);
            break;
        }
    }
}

main().catch((err) => {
    console.error("❌", err.message);
    process.exit(1);
});
