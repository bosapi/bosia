import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { todos } from "./schemas/todos.table";

export type Todo = InferSelectModel<typeof todos>;
export type NewTodo = InferInsertModel<typeof todos>;
