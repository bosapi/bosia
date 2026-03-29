import { fail } from "bosia";
import type { RequestEvent } from "bosia";
import { todoQueries } from "../../features/todo";

export async function load() {
    const todos = await todoQueries.getAll();
    return { todos };
}

export const actions = {
    create: async ({ request }: RequestEvent) => {
        const data = await request.formData();
        const title = (data.get("title") as string)?.trim();

        if (!title) {
            return fail(400, { error: "Title is required" });
        }

        await todoQueries.create({ title });
        return { success: true };
    },

    toggle: async ({ request }: RequestEvent) => {
        const data = await request.formData();
        const id = data.get("id") as string;
        const completed = data.get("completed") === "true";

        await todoQueries.toggle(id, completed);
        return { success: true };
    },

    update: async ({ request }: RequestEvent) => {
        const data = await request.formData();
        const id = data.get("id") as string;
        const title = (data.get("title") as string)?.trim();

        if (!title) {
            return fail(400, { error: "Title is required" });
        }

        await todoQueries.update(id, { title });
        return { success: true };
    },

    delete: async ({ request }: RequestEvent) => {
        const data = await request.formData();
        const id = data.get("id") as string;

        await todoQueries.remove(id);
        return { success: true };
    },
};
