import type { RequestEvent } from "bosia";
import { normalize } from "node:path";
import { FileService, getStorage } from "../../../features/file-upload";

export async function GET({ params, locals }: RequestEvent) {
	if (!locals.user) {
		return new Response("Unauthorized", { status: 401 });
	}

	const rel = Array.isArray(params.path) ? params.path.join("/") : String(params.path ?? "");

	// Path-traversal guard: normalize and refuse anything escaping the key space.
	const safe = normalize(rel).replace(/^([./\\]+)/, "");
	if (!safe || safe.includes("..")) {
		return new Response("Not found", { status: 404 });
	}

	// Ownership check — file rows carry userId; 404 (not 403) so users can't
	// probe other users' keys.
	const record = await FileService.getByKey(safe);
	if (!record || record.userId !== locals.user.id) {
		return new Response("Not found", { status: 404 });
	}

	// Stream from whichever driver is active (local FS or S3) — both proxy through
	// here so S3 objects stay private behind the same ownership gate.
	const body = await getStorage().read(safe);
	if (!body) {
		return new Response("Not found", { status: 404 });
	}

	return new Response(body, {
		headers: {
			"Content-Type": record.mime,
			"Cache-Control": "private, no-store",
		},
	});
}
