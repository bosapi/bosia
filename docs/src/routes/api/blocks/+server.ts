import type { RequestEvent } from "bosia";
import { listRegistry } from "$lib/registry/list";

export const prerender = true;

export async function GET(_event: RequestEvent) {
	const items = await listRegistry("blocks");
	const blocks = items.map((b) => ({ ...b, path: `/api/blocks/${b.path}.json` }));
	return Response.json(
		{ blocks },
		{
			headers: { "cache-control": "public, max-age=60" },
		},
	);
}
