import type { RequestEvent } from "bosia";

export const prerender = false;

export async function POST(_event: RequestEvent) {
	return Response.json({ url: "/__demo/uploaded-ok", ok: true });
}
