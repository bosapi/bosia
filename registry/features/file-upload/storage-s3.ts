import type { IStorageAdapter } from "../types";

// Bun's S3File extends Blob, so the object returned by `Bun.s3.file()` can be
// passed straight to `new Response(...)`. We only type the methods we call.
interface BunS3File extends Blob {
	write: (data: Uint8Array) => Promise<void>;
	delete: () => Promise<void>;
	exists: () => Promise<boolean>;
}

interface BunS3Like {
	s3: {
		file: (key: string, opts: { bucket: string; type?: string }) => BunS3File;
	};
}

const bunS3 = () => (Bun as unknown as BunS3Like).s3;

export class S3Storage implements IStorageAdapter {
	private bucket = process.env.S3_BUCKET ?? "";

	constructor() {
		if (!this.bucket) throw new Error("S3_BUCKET env var is required for S3 storage");
	}

	async save(key: string, data: Uint8Array, mime: string) {
		await bunS3().file(key, { bucket: this.bucket, type: mime }).write(data);
		// Serve through the app's own /uploads route (same as local), NOT a direct
		// bucket URL: the S3_ENDPOINT may be private/loopback-only, and proxying
		// keeps the per-user ownership check that direct bucket access would bypass.
		return `/uploads/${key}`;
	}

	async read(key: string): Promise<Blob | null> {
		const f = bunS3().file(key, { bucket: this.bucket });
		return (await f.exists()) ? f : null;
	}

	async delete(key: string) {
		await bunS3().file(key, { bucket: this.bucket }).delete();
	}
}
