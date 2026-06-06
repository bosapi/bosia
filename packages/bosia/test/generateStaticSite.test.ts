import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { generateStaticSite } from "../src/core/prerender.ts";

let workdir: string;
let cwdBefore: string;

function touch(path: string, body = "") {
	mkdirSync(join(path, ".."), { recursive: true });
	writeFileSync(path, body);
}

beforeEach(() => {
	workdir = realpathSync(mkdtempSync(join(tmpdir(), "bosia-genstatic-")));
	cwdBefore = process.cwd();
	// `generateStaticSite` resolves `./public` and OUT_DIR (`./dist`) relative to cwd.
	process.chdir(workdir);
});

afterEach(() => {
	process.chdir(cwdBefore);
	rmSync(workdir, { recursive: true, force: true });
});

describe("generateStaticSite", () => {
	test("mirrors ./public → ./dist/static even with zero prerendered routes", () => {
		// Pure-SSR app: tailwind wrote bosia-tw.css into public/, no prerender output.
		touch(join(workdir, "public", "bosia-tw.css"), "body{}");
		touch(join(workdir, "public", "favicon.svg"), "<svg/>");

		generateStaticSite();

		expect(existsSync(join(workdir, "dist", "static", "bosia-tw.css"))).toBe(true);
		expect(existsSync(join(workdir, "dist", "static", "favicon.svg"))).toBe(true);
		expect(readFileSync(join(workdir, "dist", "static", "bosia-tw.css"), "utf8")).toBe(
			"body{}",
		);
	});

	test("SSG build still copies prerendered HTML + client bundles", () => {
		touch(join(workdir, "public", "bosia-tw.css"), "body{}");
		touch(join(workdir, "dist", "prerendered", "about.html"), "<html/>");
		touch(join(workdir, "dist", "client", "hydrate.js"), "// js");

		generateStaticSite();

		expect(existsSync(join(workdir, "dist", "static", "bosia-tw.css"))).toBe(true);
		expect(existsSync(join(workdir, "dist", "static", "about.html"))).toBe(true);
		expect(existsSync(join(workdir, "dist", "static", "dist", "client", "hydrate.js"))).toBe(
			true,
		);
	});

	test("skips entirely when neither public/ nor prerendered/ exists", () => {
		generateStaticSite();
		expect(existsSync(join(workdir, "dist", "static"))).toBe(false);
	});
});
