import type { RequestEvent } from "bosia";
import { FileService } from "../../../features/file-upload";

export async function GET({ locals }: RequestEvent) {
	if (!locals.user) return new Response("Unauthorized", { status: 401 });
	return Response.json(await FileService.getAll(locals.user.id));
}

export async function POST({ request, locals }: RequestEvent) {
	if (!locals.user) return new Response("Unauthorized", { status: 401 });
	const formData = await request.formData();
	const file = formData.get("file");
	if (!(file instanceof File)) {
		return Response.json({ error: "Missing 'file' field" }, { status: 400 });
	}
	try {
		const record = await FileService.upload(file, locals.user.id);
		return Response.json(record, { status: 201 });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : "Upload failed";
		return Response.json({ error: message }, { status: 400 });
	}
}
