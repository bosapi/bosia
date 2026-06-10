import { eq, lt } from "drizzle-orm";
import { db } from "../drizzle";
import { session } from "./schemas/session.table";

export class SessionRepository {
	static async create(data: { id: string; userId: string; expiresAt: Date }) {
		const [row] = await db.insert(session).values(data).returning();
		return row;
	}

	static getById(id: string) {
		return db.query.session.findFirst({ where: eq(session.id, id) });
	}

	static async delete(id: string) {
		await db.delete(session).where(eq(session.id, id));
	}

	static async purgeExpired(now: Date = new Date()) {
		await db.delete(session).where(lt(session.expiresAt, now));
	}
}
