import { eq, lt } from "drizzle-orm";
import { db } from "../drizzle";
import { sessions } from "./schemas/sessions.table";

export class SessionRepository {
	static async create(data: { id: string; userId: string; expiresAt: Date }) {
		const [row] = await db.insert(sessions).values(data).returning();
		return row;
	}

	static getById(id: string) {
		return db.query.sessions.findFirst({ where: eq(sessions.id, id) });
	}

	static async delete(id: string) {
		await db.delete(sessions).where(eq(sessions.id, id));
	}

	static async purgeExpired(now: Date = new Date()) {
		await db.delete(sessions).where(lt(sessions.expiresAt, now));
	}
}
