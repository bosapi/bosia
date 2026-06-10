import type { Cookies } from "bosia";
import { AuthService } from "./auth.service";
import { SESSION_COOKIE } from "./tokens";

export interface SessionUser {
	id: string;
	email: string;
}

export async function resolveSessionFromCookies(cookies: Cookies): Promise<SessionUser | null> {
	const token = cookies.get(SESSION_COOKIE);
	if (!token) return null;
	const resolved = await AuthService.resolveSession(token);
	if (!resolved) return null;
	return { id: resolved.user.id, email: resolved.user.email };
}
