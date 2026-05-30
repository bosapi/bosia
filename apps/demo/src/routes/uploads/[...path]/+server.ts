import type { RequestEvent } from "bosia";
import { join, normalize } from "node:path";

const ROOT = process.env.UPLOAD_DIR ?? "./uploads";
const MIME: Record<string, string> = {
	".webp": "image/webp",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".pdf": "application/pdf",
};

export async function GET({ params }: RequestEvent) {
	const rel = Array.isArray(params.path) ? params.path.join("/") : String(params.path ?? "");
	const safe = normalize(rel).replace(/^([./\\]+)/, "");
	if (!safe || safe.includes("..")) {
		return new Response("not found", { status: 404 });
	}

	const file = Bun.file(join(ROOT, safe));
	if (!(await file.exists())) {
		return new Response("not found", { status: 404 });
	}

	const dot = safe.lastIndexOf(".");
	const ext = dot === -1 ? "" : safe.slice(dot).toLowerCase();
	const contentType = MIME[ext] ?? "application/octet-stream";

	return new Response(file, {
		headers: {
			"Content-Type": contentType,
			"X-Handler": "uploads-route",
		},
	});
}
