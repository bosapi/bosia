import type { IStorageAdapter } from "../types";

interface BunS3Like {
	s3: {
		file: (
			key: string,
			opts: { bucket: string; type?: string },
		) => {
			write: (data: Uint8Array) => Promise<void>;
			delete: () => Promise<void>;
		};
	};
}

const bunS3 = () => (Bun as unknown as BunS3Like).s3;

export class S3Storage implements IStorageAdapter {
	private bucket = process.env.S3_BUCKET ?? "";
	private endpoint = process.env.S3_ENDPOINT ?? "";

	constructor() {
		if (!this.bucket) throw new Error("S3_BUCKET env var is required for S3 storage");
	}

	async save(key: string, data: Uint8Array, mime: string) {
		await bunS3().file(key, { bucket: this.bucket, type: mime }).write(data);
		return this.endpoint
			? `${this.endpoint.replace(/\/$/, "")}/${this.bucket}/${key}`
			: `https://${this.bucket}.s3.amazonaws.com/${key}`;
	}

	async delete(key: string) {
		await bunS3().file(key, { bucket: this.bucket }).delete();
	}
}
