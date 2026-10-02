import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { extname, join } from "path";
import { promisify } from "util";
import { brotliCompress, gzip, constants as zlibConstants } from "node:zlib";

// ─── Build-time Precompression ───────────────────────────
// Writes `file.br` + `file.gz` next to each compressible build output so the
// server hands out ready-made bytes (staticManifest.ts `serveStatic`) instead of
// raw ones. Build time is paid once, so both run at max quality.

const brotliAsync = promisify(brotliCompress);
const gzipAsync = promisify(gzip);

const COMPRESSIBLE = new Set([
	".js",
	".css",
	".html",
	".json",
	".svg",
	".txt",
	".xml",
	".webmanifest",
	".map",
]);

// Same floor as the runtime compress(): below it the overhead beats the saving.
const MIN_BYTES = 2048;

function* files(dir: string): Generator<string> {
	let entries: Array<{ name: string; isDirectory(): boolean; isFile(): boolean }>;
	try {
		entries = readdirSync(dir, { withFileTypes: true, encoding: "utf8" }) as unknown as Array<{
			name: string;
			isDirectory(): boolean;
			isFile(): boolean;
		}>;
	} catch {
		return;
	}
	for (const ent of entries) {
		const abs = join(dir, ent.name);
		if (ent.isDirectory()) yield* files(abs);
		else if (ent.isFile()) yield abs;
	}
}

export type PrecompressStats = { files: number; rawBytes: number; brBytes: number };

/**
 * Precompress every compressible file under `dir`. A variant is only written
 * when it is smaller than the original, so the server can trust any sibling it
 * finds. Missing `dir` is a no-op.
 */
export async function precompressDir(dir: string): Promise<PrecompressStats> {
	const stats: PrecompressStats = { files: 0, rawBytes: 0, brBytes: 0 };
	const jobs: Promise<void>[] = [];
	for (const abs of files(dir)) {
		if (!COMPRESSIBLE.has(extname(abs))) continue;
		if (statSync(abs).size < MIN_BYTES) continue;
		jobs.push(
			(async () => {
				const raw = readFileSync(abs);
				const [br, gz] = await Promise.all([
					brotliAsync(raw, {
						params: {
							[zlibConstants.BROTLI_PARAM_QUALITY]: zlibConstants.BROTLI_MAX_QUALITY,
							[zlibConstants.BROTLI_PARAM_SIZE_HINT]: raw.length,
						},
					}),
					gzipAsync(raw, { level: 9 }),
				]);
				if (br.length < raw.length) writeFileSync(`${abs}.br`, br);
				if (gz.length < raw.length) writeFileSync(`${abs}.gz`, gz);
				stats.files++;
				stats.rawBytes += raw.length;
				stats.brBytes += Math.min(br.length, raw.length);
			})(),
		);
	}
	await Promise.all(jobs);
	return stats;
}
