export async function hashPassword(plain: string): Promise<string> {
	return Bun.password.hash(plain, { algorithm: "argon2id" });
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
	try {
		return await Bun.password.verify(plain, hash);
	} catch {
		return false;
	}
}
