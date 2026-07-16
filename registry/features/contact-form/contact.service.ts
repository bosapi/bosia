import { SubmissionRepository } from "./submission.repository";

const MAX = { name: 200, email: 254, message: 5000 } as const;

export class ContactService {
	// plain checks, no schema lib; swap for one when the form grows more fields
	static async submit(input: Record<string, unknown>) {
		const name = typeof input.name === "string" ? input.name.trim() : "";
		const email = typeof input.email === "string" ? input.email.trim() : "";
		const message = typeof input.message === "string" ? input.message.trim() : "";

		if (!name || name.length > MAX.name) {
			throw new Error(`Name is required (max ${MAX.name} characters)`);
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > MAX.email) {
			throw new Error("A valid email is required");
		}
		if (!message || message.length > MAX.message) {
			throw new Error(`Message is required (max ${MAX.message} characters)`);
		}

		await SubmissionRepository.create({ name, email, message });
	}

	static getAll() {
		return SubmissionRepository.getAll();
	}
}
