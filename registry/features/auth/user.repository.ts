import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { users } from "./schemas/users.table";

export class UserRepository {
	static getById(id: string) {
		return db.query.users.findFirst({ where: eq(users.id, id) });
	}

	static getByEmail(email: string) {
		return db.query.users.findFirst({ where: eq(users.email, email) });
	}

	static async create(data: { email: string; passwordHash: string }) {
		const [row] = await db.insert(users).values(data).returning();
		return row;
	}

	static async count(): Promise<number> {
		const rows = await db.query.users.findMany({ columns: { id: true } });
		return rows.length;
	}
}
