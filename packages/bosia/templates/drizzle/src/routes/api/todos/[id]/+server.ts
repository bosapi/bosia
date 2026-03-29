import type { RequestEvent } from "bosia";
import { todoQueries } from "../../../../features/todo";

export async function GET({ params }: RequestEvent) {
    const todo = await todoQueries.getById(params.id);

    if (!todo) {
        return Response.json({ error: "Todo not found" }, { status: 404 });
    }

    return Response.json(todo);
}

export async function PUT({ params, request }: RequestEvent) {
    const body = await request.json().catch(() => null);

    if (!body || (body.title !== undefined && !body.title?.trim())) {
        return Response.json({ error: "Invalid body" }, { status: 400 });
    }

    const data: { title?: string; completed?: boolean } = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.completed !== undefined) data.completed = body.completed;

    const [todo] = await todoQueries.update(params.id, data);

    if (!todo) {
        return Response.json({ error: "Todo not found" }, { status: 404 });
    }

    return Response.json(todo);
}

export async function DELETE({ params }: RequestEvent) {
    const [todo] = await todoQueries.remove(params.id);

    if (!todo) {
        return Response.json({ error: "Todo not found" }, { status: 404 });
    }

    return Response.json(todo);
}
