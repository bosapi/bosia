import type { RequestEvent } from "bosia";
import { todoQueries } from "../../../features/todo";

export async function GET() {
    const todos = await todoQueries.getAll();
    return Response.json(todos);
}

export async function POST({ request }: RequestEvent) {
    const body = await request.json().catch(() => null);

    if (!body?.title?.trim()) {
        return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const [todo] = await todoQueries.create({ title: body.title.trim() });
    return Response.json(todo, { status: 201 });
}
