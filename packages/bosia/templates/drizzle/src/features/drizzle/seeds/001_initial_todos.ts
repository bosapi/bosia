import type { Database } from "../index";
import { todos } from "../../todo/schemas/todo.table";

export async function seed(db: Database) {
    await db.insert(todos).values([
        { title: "Learn Bosia framework" },
        { title: "Set up PostgreSQL with Drizzle" },
        { title: "Build a full-stack app", completed: true },
        { title: "Deploy to production" },
    ]);
}
