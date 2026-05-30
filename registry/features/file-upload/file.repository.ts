import { and, eq } from "drizzle-orm";
import { db } from "../drizzle";
import { file } from "./schemas/file.table";
import type { NewFileRecord } from "./types";

export class FileRepository {
	static async getAllByUser(userId: string) {
		return db.query.file.findMany({
			where: eq(file.userId, userId),
			orderBy: (f, { desc }) => [desc(f.createdAt)],
		});
	}

	static async getByKey(key: string) {
		return db.query.file.findFirst({ where: eq(file.key, key) });
	}

	static async getOwned(id: string, userId: string) {
		return db.query.file.findFirst({
			where: and(eq(file.id, id), eq(file.userId, userId)),
		});
	}

	static async create(data: NewFileRecord) {
		const inserted = await db.insert(file).values(data).returning();
		return inserted;
	}

	static async remove(id: string, userId: string) {
		return db
			.delete(file)
			.where(and(eq(file.id, id), eq(file.userId, userId)))
			.returning();
	}
}
