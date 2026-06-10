const TOKEN_BYTES = 32;

function toBase64Url(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString("base64url");
}

export function mintSessionToken(): string {
	const buf = new Uint8Array(TOKEN_BYTES);
	crypto.getRandomValues(buf);
	return toBase64Url(buf);
}

export const SESSION_COOKIE = "bosia_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
