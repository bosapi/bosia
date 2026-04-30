import type { RequestEvent } from "bosia";
import { TodoService } from "../../../../features/todo";

export async function GET({ params }: RequestEvent) {
	const todo = await TodoService.getById(params.id);
	if (!todo) {
		return Response.json({ error: "Todo not found" }, { status: 404 });
	}
	return Response.json(todo);
}

export async function PUT({ params, request }: RequestEvent) {
	const body = await request.json().catch(() => null);
	if (!body) {
		return Response.json({ error: "Invalid body" }, { status: 400 });
	}

	const data: { title?: string; completed?: boolean } = {};
	if (body.title !== undefined) data.title = body.title;
	if (body.completed !== undefined) data.completed = body.completed;

	try {
		const todo = await TodoService.update(params.id, data);
		if (!todo) {
			return Response.json({ error: "Todo not found" }, { status: 404 });
		}
		return Response.json(todo);
	} catch (e: any) {
		return Response.json({ error: e.message }, { status: 400 });
	}
}

export async function DELETE({ params }: RequestEvent) {
	const todo = await TodoService.remove(params.id);
	if (!todo) {
		return Response.json({ error: "Todo not found" }, { status: 404 });
	}
	return Response.json(todo);
}
