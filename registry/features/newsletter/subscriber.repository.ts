import { db } from "../drizzle";
import { newsletterSubscribers } from "./schemas/subscribers.table";

export class SubscriberRepository {
	static async findByEmail(email: string) {
		return db.query.newsletterSubscribers.findFirst({
			where: (s, { eq }) => eq(s.email, email),
		});
	}

	// insert-only, no returning(): keeps one file valid across all three dialects
	static async create(email: string) {
		await db.insert(newsletterSubscribers).values({ email });
	}

	static async getAll() {
		return db.query.newsletterSubscribers.findMany({
			orderBy: (s, { desc }) => [desc(s.createdAt)],
		});
	}
}
