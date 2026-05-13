// ─── CSP Nonce ───────────────────────────────────────────
// Per-request cryptographic nonce. Embedded as `nonce="..."` on every
// framework-emitted <script> tag so that user code (or operators) can
// configure a `Content-Security-Policy` header with `script-src 'nonce-…'`
// and lock down inline-script execution without breaking framework
// hydration.
//
// 16 random bytes → base64 (22 chars after stripping `=` padding) gives
// the 128 bits of entropy recommended by the CSP spec.

const NONCE_BYTES = 16;

export function generateNonce(): string {
	const bytes = new Uint8Array(NONCE_BYTES);
	crypto.getRandomValues(bytes);
	let binary = "";
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary).replace(/=+$/, "");
}

/** Returns ` nonce="…"` (with leading space) when `nonce` is non-empty, otherwise `""`. */
export function nonceAttr(nonce: string | undefined): string {
	return nonce ? ` nonce="${nonce}"` : "";
}

// ─── Optional CSP Header ─────────────────────────────────
// Opt-in via `CSP_DIRECTIVES` env. The literal `{nonce}` placeholder in
// the configured value is replaced with the per-request nonce on each
// response. Empty/unset env → no `Content-Security-Policy` header.
//
// Example:
//   CSP_DIRECTIVES="default-src 'self'; script-src 'self' 'nonce-{nonce}'"

export const CSP_DIRECTIVES_TEMPLATE: string | null = process.env.CSP_DIRECTIVES?.trim() || null;

/**
 * `true` when an operator has opted into CSP via `CSP_DIRECTIVES`. The
 * framework gates *all* nonce-related wire output on this flag — without a
 * matching `Content-Security-Policy` header the nonce attribute is just dead
 * bytes, so we omit it.
 */
export const CSP_ENABLED: boolean = CSP_DIRECTIVES_TEMPLATE !== null;

export function buildCspHeader(nonce: string): string | null {
	if (!CSP_DIRECTIVES_TEMPLATE) return null;
	return CSP_DIRECTIVES_TEMPLATE.replace(/\{nonce\}/g, nonce);
}
