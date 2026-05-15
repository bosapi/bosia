import type { RequestEvent } from "bosia";
import { listRegistry } from "$lib/registry/list";

export async function GET(_event: RequestEvent) {
	const components = await listRegistry("components");
	return Response.json(
		{ components },
		{
			headers: { "cache-control": "public, max-age=60" },
		},
	);
}
