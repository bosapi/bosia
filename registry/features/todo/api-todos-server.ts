import type { RequestEvent } from "bosia";
import { TodoService } from "../../../features/todo";

export async function GET() {
    const todos = await TodoService.getAll();
    return Response.json(todos);
}

export async function POST({ request }: RequestEvent) {
    const body = await request.json().catch(() => null);

    try {
        const todo = await TodoService.create(body?.title);
        return Response.json(todo, { status: 201 });
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: 400 });
    }
}
