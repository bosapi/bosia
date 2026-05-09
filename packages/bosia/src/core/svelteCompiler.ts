import { compile, compileModule } from "svelte/compiler";
import type { BunPlugin } from "bun";

const svelteHash = (s: string) => Bun.hash(s, 5381).toString(36);

export function makeBosiaSvelteCompiler(target: "browser" | "bun"): BunPlugin {
	const generate = target === "browser" ? "client" : "server";
	const dev = process.env.NODE_ENV !== "production";

	return {
		name: "bosia-svelte-compiler",
		setup(build) {
			const ts = new Bun.Transpiler({
				loader: "ts",
				target: target === "browser" ? "browser" : "bun",
			});

			build.onLoad({ filter: /\.svelte$/ }, async (args) => {
				const source = await Bun.file(args.path).text();
				const result = compile(source, {
					generate,
					css: target === "browser" ? "injected" : "external",
					dev,
					hmr: false,
					cssHash: ({ css }) => `svelte-${svelteHash(css)}`,
					filename: args.path,
				});
				return { contents: result.js.code, loader: "ts" };
			});

			build.onLoad({ filter: /\.svelte\.[tj]s$/ }, async (args) => {
				let source = await Bun.file(args.path).text();
				if (args.path.endsWith(".ts")) {
					source = await ts.transform(source);
				}
				const result = compileModule(source, {
					generate,
					dev,
					filename: args.path,
				});
				return { contents: result.js.code, loader: "js" };
			});
		},
	};
}
