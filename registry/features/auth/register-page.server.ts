import { fail, redirect } from "bosia";
import type { RequestEvent } from "bosia";
import { AuthService, SESSION_COOKIE, SESSION_TTL_MS, safeNext } from "../../../features/auth";

export async function load({ locals, url }: RequestEvent) {
	if (locals.user) throw redirect(303, safeNext(url.searchParams.get("next")));
	return {};
}

export const actions = {
	default: async ({ request, cookies, url }: RequestEvent) => {
		const data = await request.formData();
		const email = (data.get("email") ?? "").toString();
		const password = (data.get("password") ?? "").toString();

		try {
			const user = await AuthService.register(email, password);
			const session = await AuthService.createSession(user.id);
			cookies.set(SESSION_COOKIE, session.id, {
				path: "/",
				httpOnly: true,
				sameSite: "Lax",
				secure: process.env.NODE_ENV === "production",
				maxAge: Math.floor(SESSION_TTL_MS / 1000),
				expires: session.expiresAt,
			});
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : "Registration failed";
			return fail(400, { error: message, email });
		}

		throw redirect(303, safeNext(url.searchParams.get("next")));
	},
};
