import type { RequestEvent } from "bosia";
import { listSkills } from "$lib/skills/list";

export const prerender = true;

export async function GET(_event: RequestEvent) {
	const items = await listSkills();
	const skills = items.map((s) => ({ ...s, path: `/api/skills/${s.name}.json` }));
	return Response.json(
		{ skills },
		{
			headers: { "cache-control": "public, max-age=60" },
		},
	);
}
