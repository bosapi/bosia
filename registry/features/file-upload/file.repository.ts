import { and, eq } from "drizzle-orm";
import { db } from "../drizzle";
import { files } from "./schemas/files.table";
import type { NewFileRecord } from "./types";

export class FileRepository {
	static async getAllByUser(userId: string) {
		return db.query.files.findMany({
			where: eq(files.userId, userId),
			orderBy: (f, { desc }) => [desc(f.createdAt)],
		});
	}

	static async getByKey(key: string) {
		return db.query.files.findFirst({ where: eq(files.key, key) });
	}

	static async getOwned(id: string, userId: string) {
		return db.query.files.findFirst({
			where: and(eq(files.id, id), eq(files.userId, userId)),
		});
	}

	static async create(data: NewFileRecord) {
		const inserted = await db.insert(files).values(data).returning();
		return inserted;
	}

	static async remove(id: string, userId: string) {
		return db
			.delete(files)
			.where(and(eq(files.id, id), eq(files.userId, userId)))
			.returning();
	}
}
