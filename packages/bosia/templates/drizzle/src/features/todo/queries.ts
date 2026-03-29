import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { todos } from "./schemas/todo.table";
import type { NewTodo } from "./types";

export function getAll() {
    return db.query.todos.findMany({
        orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
}

export function getById(id: string) {
    return db.query.todos.findFirst({
        where: eq(todos.id, id),
    });
}

export function create(data: Pick<NewTodo, "title">) {
    return db.insert(todos).values(data).returning();
}

export function update(id: string, data: Partial<Pick<NewTodo, "title" | "completed">>) {
    return db
        .update(todos)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(todos.id, id))
        .returning();
}

export function toggle(id: string, completed: boolean) {
    return update(id, { completed });
}

export function remove(id: string) {
    return db.delete(todos).where(eq(todos.id, id)).returning();
}
