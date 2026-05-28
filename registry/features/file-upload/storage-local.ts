import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { IStorageAdapter } from "../types";

export class LocalStorage implements IStorageAdapter {
	private dir = process.env.UPLOAD_DIR ?? "./uploads";

	async save(key: string, data: Uint8Array, _mime: string) {
		await mkdir(this.dir, { recursive: true });
		await Bun.write(join(this.dir, key), data);
		return `/uploads/${key}`;
	}

	async delete(key: string) {
		const f = Bun.file(join(this.dir, key));
		if (await f.exists()) await f.delete();
	}
}
