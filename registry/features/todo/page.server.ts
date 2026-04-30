import { fail } from "bosia";
import type { RequestEvent } from "bosia";
import { TodoService } from "../../features/todo";

export async function load() {
	const todos = await TodoService.getAll();
	return { todos };
}

export const actions = {
	create: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const title = data.get("title") as string;

		try {
			await TodoService.create(title);
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
	},

	toggle: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const id = data.get("id") as string;
		const completed = data.get("completed") === "true";

		await TodoService.toggle(id, completed);
		return { success: true };
	},

	update: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const id = data.get("id") as string;
		const title = data.get("title") as string;

		try {
			await TodoService.update(id, { title });
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
	},

	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const id = data.get("id") as string;

		await TodoService.remove(id);
		return { success: true };
	},
};
