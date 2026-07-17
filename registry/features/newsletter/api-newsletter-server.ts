import type { RequestEvent } from "bosia";
import { NewsletterService } from "../../../features/newsletter";

// no rate limit; add a honeypot field or captcha if spam becomes a problem
export async function POST({ request }: RequestEvent) {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON body" }, { status: 400 });
	}
	try {
		await NewsletterService.subscribe(body);
		return Response.json({ ok: true }, { status: 201 });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : "Subscription failed";
		return Response.json({ error: message }, { status: 400 });
	}
}

export async function GET({ locals }: RequestEvent) {
	if (!locals.user) return new Response("Unauthorized", { status: 401 });
	return Response.json(await NewsletterService.getAll());
}
