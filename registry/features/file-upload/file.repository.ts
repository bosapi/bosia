import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { file } from "./schemas/file.table";
import type { NewFileRecord } from "./types";

export class FileRepository {
	static async getAll() {
		return db.query.file.findMany({
			orderBy: (f, { desc }) => [desc(f.createdAt)],
		});
	}

	static async getById(id: string) {
		return db.query.file.findFirst({ where: eq(file.id, id) });
	}

	static async create(data: NewFileRecord) {
		const inserted = await db.insert(file).values(data).returning();
		return inserted;
	}

	static async remove(id: string) {
		return db.delete(file).where(eq(file.id, id)).returning();
	}
}
