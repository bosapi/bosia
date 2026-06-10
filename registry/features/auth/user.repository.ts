import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { user } from "./schemas/user.table";

export class UserRepository {
	static getById(id: string) {
		return db.query.user.findFirst({ where: eq(user.id, id) });
	}

	static getByEmail(email: string) {
		return db.query.user.findFirst({ where: eq(user.email, email) });
	}

	static async create(data: { email: string; passwordHash: string }) {
		const [row] = await db.insert(user).values(data).returning();
		return row;
	}

	static async count(): Promise<number> {
		const rows = await db.query.user.findMany({ columns: { id: true } });
		return rows.length;
	}
}
