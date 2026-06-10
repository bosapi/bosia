import { redirect } from "bosia";
import type { RequestEvent } from "bosia";
import { AuthService, SESSION_COOKIE } from "../../features/auth";

export async function POST({ cookies }: RequestEvent) {
	const token = cookies.get(SESSION_COOKIE);
	if (token) await AuthService.destroySession(token);
	cookies.delete(SESSION_COOKIE, { path: "/" });
	throw redirect(303, "/");
}
