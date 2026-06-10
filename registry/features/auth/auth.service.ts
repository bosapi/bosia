import { UserRepository } from "./user.repository";
import { SessionRepository } from "./session.repository";
import { hashPassword, verifyPassword } from "./password";
import { mintSessionToken, SESSION_TTL_MS } from "./tokens";

export interface AuthSession {
	id: string;
	userId: string;
	expiresAt: Date;
}

export class AuthService {
	static async register(email: string, password: string) {
		const normalized = email.trim().toLowerCase();
		if (!normalized || !password) throw new Error("Email and password are required");
		if (password.length < 8) throw new Error("Password must be at least 8 characters");

		const existing = await UserRepository.getByEmail(normalized);
		if (existing) throw new Error("Account already exists");

		const passwordHash = await hashPassword(password);
		const created = await UserRepository.create({ email: normalized, passwordHash });
		return created;
	}

	static async login(email: string, password: string) {
		const normalized = email.trim().toLowerCase();
		const user = await UserRepository.getByEmail(normalized);
		if (!user) throw new Error("Invalid email or password");
		const ok = await verifyPassword(password, user.passwordHash);
		if (!ok) throw new Error("Invalid email or password");
		return user;
	}

	static async createSession(userId: string): Promise<AuthSession> {
		const id = mintSessionToken();
		const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
		const row = await SessionRepository.create({ id, userId, expiresAt });
		return { id: row.id, userId: row.userId, expiresAt: row.expiresAt };
	}

	static async destroySession(id: string) {
		await SessionRepository.delete(id);
	}

	static async resolveSession(id: string) {
		const row = await SessionRepository.getById(id);
		if (!row) return null;
		if (row.expiresAt.getTime() < Date.now()) {
			await SessionRepository.delete(row.id);
			return null;
		}
		const user = await UserRepository.getById(row.userId);
		if (!user) return null;
		return { user, session: row };
	}
}
