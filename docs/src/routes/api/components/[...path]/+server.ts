import type { RequestEvent } from "bosia";
import { getRegistryDetail, listRegistry } from "$lib/registry/list";

export const prerender = true;

export async function entries(): Promise<{ path: string }[]> {
	const items = await listRegistry("components");
	return items.map((i) => ({ path: i.path }));
}

export async function GET({ params }: RequestEvent) {
	const path = params.path;
	if (!path) return new Response("bad path", { status: 400 });
	const detail = await getRegistryDetail("components", path);
	if (!detail) return new Response("not found", { status: 404 });
	return Response.json(
		{ ...detail, path: `/api/components/${detail.path}.json` },
		{ headers: { "cache-control": "public, max-age=60" } },
	);
}
