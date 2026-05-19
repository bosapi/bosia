import type { RequestEvent } from "bosia";
import { listRegistry } from "$lib/registry/list";

export const prerender = true;

export async function GET(_event: RequestEvent) {
	const items = await listRegistry("themes");
	const themes = items.map((t) => ({ ...t, path: `/api/themes/${t.path}.json` }));
	return Response.json(
		{ themes },
		{
			headers: { "cache-control": "public, max-age=60" },
		},
	);
}
