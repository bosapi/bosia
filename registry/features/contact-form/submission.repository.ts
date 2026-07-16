import { db } from "../drizzle";
import { contactSubmissions } from "./schemas/submissions.table";

export class SubmissionRepository {
	// insert-only, no returning(): keeps one file valid across all three dialects
	static async create(data: typeof contactSubmissions.$inferInsert) {
		await db.insert(contactSubmissions).values(data);
	}

	static async getAll() {
		return db.query.contactSubmissions.findMany({
			orderBy: (s, { desc }) => [desc(s.createdAt)],
		});
	}
}
