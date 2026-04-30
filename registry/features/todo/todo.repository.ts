import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { todos } from "./schemas/todo.table";
import type { NewTodo } from "./types";

export class TodoRepository {
	static async getAll() {
		return db.query.todos.findMany({
			orderBy: (t, { desc }) => [desc(t.createdAt)],
		});
	}

	static async getById(id: string) {
		return db.query.todos.findFirst({
			where: eq(todos.id, id),
		});
	}

	static async create(data: Pick<NewTodo, "title">) {
		return db.insert(todos).values(data).returning();
	}

	static async update(id: string, data: Partial<Pick<NewTodo, "title" | "completed">>) {
		return db
			.update(todos)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(todos.id, id))
			.returning();
	}

	static async remove(id: string) {
		return db.delete(todos).where(eq(todos.id, id)).returning();
	}
}
