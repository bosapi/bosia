import type { RequestEvent } from "bosia";
import { listRegistry } from "$lib/registry/list";

export async function GET(_event: RequestEvent) {
	const blocks = await listRegistry("blocks");
	return Response.json(
		{ blocks },
		{
			headers: { "cache-control": "public, max-age=60" },
		},
	);
}
