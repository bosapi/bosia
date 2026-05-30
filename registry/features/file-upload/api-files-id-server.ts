import type { RequestEvent } from "bosia";
import { FileService } from "../../../../features/file-upload";

export async function DELETE({ params, locals }: RequestEvent) {
	if (!locals.user) return new Response("Unauthorized", { status: 401 });
	try {
		const row = await FileService.remove(params.id, locals.user.id);
		return Response.json(row);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : "Delete failed";
		return Response.json({ error: message }, { status: 404 });
	}
}
