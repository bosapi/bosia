import type { RequestEvent } from "bosia";
import { getRegistryDetail } from "$lib/registry/list";

export async function GET({ params }: RequestEvent) {
	const path = params.path;
	if (!path) return new Response("bad path", { status: 400 });
	const detail = await getRegistryDetail("blocks", path);
	if (!detail) return new Response("not found", { status: 404 });
	return Response.json(detail, {
		headers: { "cache-control": "public, max-age=60" },
	});
}
