import { TodoRepository } from "./todo.repository";

export class TodoService {
    static async getAll() {
        return TodoRepository.getAll();
    }

    static async getById(id: string) {
        return TodoRepository.getById(id);
    }

    static async create(title: string) {
        const trimmed = title?.trim();
        if (!trimmed) {
            throw new Error("Title is required");
        }
        const [todo] = await TodoRepository.create({ title: trimmed });
        return todo;
    }

    static async update(id: string, data: { title?: string; completed?: boolean }) {
        if (data.title !== undefined) {
            const trimmed = data.title.trim();
            if (!trimmed) {
                throw new Error("Title is required");
            }
            data.title = trimmed;
        }
        const [todo] = await TodoRepository.update(id, data);
        return todo;
    }

    static async toggle(id: string, completed: boolean) {
        const [todo] = await TodoRepository.update(id, { completed });
        return todo;
    }

    static async remove(id: string) {
        const [todo] = await TodoRepository.remove(id);
        return todo;
    }
}
