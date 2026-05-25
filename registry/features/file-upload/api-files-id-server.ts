import type { RequestEvent } from "bosia";
import { FileService } from "../../../../features/file-upload";

export async function DELETE({ params }: RequestEvent) {
	try {
		const row = await FileService.remove(params.id);
		return Response.json(row);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : "Delete failed";
		return Response.json({ error: message }, { status: 404 });
	}
}
