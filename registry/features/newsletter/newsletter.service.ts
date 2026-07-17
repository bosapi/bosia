import { SubscriberRepository } from "./subscriber.repository";

const MAX_EMAIL = 254;

export class NewsletterService {
	// duplicate-safe: subscribing twice is a success, not an error
	static async subscribe(input: Record<string, unknown>) {
		const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > MAX_EMAIL) {
			throw new Error("A valid email is required");
		}

		if (await SubscriberRepository.findByEmail(email)) return;
		try {
			await SubscriberRepository.create(email);
		} catch (e) {
			// unique-constraint race between check and insert — already subscribed, fine
			if (await SubscriberRepository.findByEmail(email)) return;
			throw e;
		}
	}

	static getAll() {
		return SubscriberRepository.getAll();
	}
}
