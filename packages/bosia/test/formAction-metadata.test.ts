import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// metadata() was resolved only on the GET path, so a plain (non-enhance) form
// POST re-rendered the page with no title, no description, lang="en" and a null
// `metadata` in load(). A unit test on buildHtml would have passed the whole
// time the bug shipped — the missing piece was the call site, so this boots a
// real built server and submits a real form.
//
// Fixture lives under packages/bosia/ so svelte and the Tailwind binary resolve
// from this package's node_modules — same reason as basePath-server.test.ts.

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;

/** Every assertion below reads an attribute, never text: Svelte's SSR output
 *  splits `{expr}` in a text node with comment markers, attributes it doesn't. */
function assertMetadataApplied(html: string) {
	expect(html).toContain("<title>Kontak — Fisika</title>");
	expect(html).toContain(`<meta name="description" content="Hubungi kami" data-bosia-meta>`);
	expect(html).toContain(`<meta property="og:title" content="Kontak" data-bosia-meta>`);
	expect(html).toContain(
		`<link rel="canonical" href="https://fisika.test/kontak" data-bosia-meta>`,
	);
	expect(html).toContain('lang="id"');
	expect(html).not.toContain("Bosia App");
	// Proves metadata.data reached load() instead of the hardcoded null.
	expect(html).toContain(`data-echo="dari-metadata"`);
}

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-formaction-metadata-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	mkdirSync(routes, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);

	writeFileSync(join(routes, "+page.svelte"), `<h1>Beranda</h1>\n`);

	// No <title> of its own — the framework must synthesize one from the status.
	writeFileSync(join(routes, "+error.svelte"), `<h1>Aduh</h1>\n`);

	mkdirSync(join(routes, "kontak"), { recursive: true });
	writeFileSync(
		join(routes, "kontak", "+page.svelte"),
		`<script>\n\tlet { data, form } = $props();\n</script>\n\n` +
			`<p data-echo={data.echo} data-sent={form?.sent ?? "belum"}>Kontak</p>\n` +
			`<form method="POST"><button>Kirim</button></form>\n`,
	);
	writeFileSync(
		join(routes, "kontak", "+page.server.ts"),
		`export function metadata() {\n` +
			`\treturn {\n` +
			`\t\ttitle: "Kontak — Fisika",\n` +
			`\t\tdescription: "Hubungi kami",\n` +
			`\t\tlang: "id",\n` +
			`\t\tmeta: [{ property: "og:title", content: "Kontak" }],\n` +
			`\t\tlink: [{ rel: "canonical", href: "https://fisika.test/kontak" }],\n` +
			`\t\tdata: { echo: "dari-metadata" },\n` +
			`\t};\n` +
			`}\n\n` +
			`export function load({ metadata }: any) {\n` +
			`\treturn { echo: metadata?.echo ?? "KOSONG" };\n` +
			`}\n\n` +
			`export const actions = {\n` +
			`\tdefault: async () => ({ sent: "ya" }),\n` +
			`};\n`,
	);

	// redirect() thrown from metadata() used to be logged and swallowed.
	mkdirSync(join(routes, "lompat"), { recursive: true });
	writeFileSync(join(routes, "lompat", "+page.svelte"), `<h1>Lompat</h1>\n`);
	writeFileSync(
		join(routes, "lompat", "+page.server.ts"),
		`import { redirect } from "bosia";\nexport function metadata() {\n\tredirect(303, "/daftar");\n}\n`,
	);

	mkdirSync(join(routes, "daftar"), { recursive: true });
	writeFileSync(join(routes, "daftar", "+page.svelte"), `<h1>Daftar</h1>\n`);

	const build = Bun.spawn(["bun", "run", join(import.meta.dir, "..", "src", "core", "build.ts")], {
		cwd: tmpDir,
		env: { ...process.env, NODE_ENV: "production", NODE_PATH: BOSIA_NODE_PATH },
		stdout: "pipe",
		stderr: "pipe",
	});
	const [code, out, err] = await Promise.all([
		build.exited,
		new Response(build.stdout).text(),
		new Response(build.stderr).text(),
	]);
	if (code !== 0) throw new Error(`build failed (${code})\n${out}\n${err}`);

	const port = await getEphemeralPort();
	origin = `http://localhost:${port}`;
	child = Bun.spawn(["bun", "run", join(tmpDir, "dist", "server", "index.js")], {
		cwd: tmpDir,
		env: {
			...process.env,
			NODE_ENV: "production",
			PORT: String(port),
			NODE_PATH: BOSIA_NODE_PATH,
		},
		stdout: "ignore",
		stderr: "ignore",
	});

	const deadline = Date.now() + 15_000;
	while (Date.now() < deadline) {
		try {
			if ((await fetch(`${origin}/_health`)).ok) return;
		} catch {
			/* not up yet */
		}
		await Bun.sleep(50);
	}
	throw new Error("server never became ready");
}, 180_000);

afterAll(() => {
	child?.kill();
	rmSync(tmpDir, { recursive: true, force: true });
});

describe("metadata() on a form-action re-render", () => {
	test("GET renders the metadata — the path that always worked", async () => {
		const res = await fetch(`${origin}/kontak`);
		expect(res.status).toBe(200);
		assertMetadataApplied(await res.text());
	});

	test("POST to the default action renders the same metadata", async () => {
		const res = await fetch(`${origin}/kontak`, {
			method: "POST",
			headers: { origin, "content-type": "application/x-www-form-urlencoded" },
			body: "nama=Jeki",
			redirect: "manual",
		});
		expect(res.status).toBe(200);
		const html = await res.text();
		assertMetadataApplied(html);
		// Sanity: the action really ran, so this is the form-action path.
		expect(html).toContain(`data-sent="ya"`);
	});
});

describe("the client router's data endpoint", () => {
	// The router only ever saw `title` and `description` here, so og:/canonical/lang
	// stayed frozen at the first-loaded page across every client-side navigation.
	test("carries every head field metadata() can set — never metadata.data", async () => {
		const res = await fetch(`${origin}/__bosia/data/kontak.json`);
		expect(res.status).toBe(200);
		const { metadata } = await res.json();
		expect(metadata.title).toBe("Kontak — Fisika");
		expect(metadata.description).toBe("Hubungi kami");
		expect(metadata.lang).toBe("id");
		expect(metadata.meta).toEqual([{ property: "og:title", content: "Kontak" }]);
		expect(metadata.link).toEqual([{ rel: "canonical", href: "https://fisika.test/kontak" }]);
		// metadata.data feeds load() server-side and may hold secrets — it stays there.
		expect(metadata.data).toBeUndefined();
	});
});

describe("control flow thrown from metadata()", () => {
	test("redirect() is honoured instead of swallowed", async () => {
		const res = await fetch(`${origin}/lompat`, { redirect: "manual" });
		expect(res.status).toBe(303);
		expect(res.headers.get("location")).toBe("/daftar");
	});
});

describe("error pages", () => {
	test("a 404 titles itself from the status, not the framework default", async () => {
		const res = await fetch(`${origin}/tidak-ada`);
		expect(res.status).toBe(404);
		const html = await res.text();
		expect(html).toContain("404");
		expect(html).toContain("<title>404 — Not Found</title>");
		expect(html).not.toContain("Bosia App");
	});
});
