import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { files } from "./schemas/files.table";

export type FileRecord = InferSelectModel<typeof files>;
export type NewFileRecord = InferInsertModel<typeof files>;

export type StorageDriver = "local" | "s3";

export interface IStorageAdapter {
	// Persist bytes and return the URL clients use to fetch them back. Both drivers
	// return an app-relative `/uploads/<key>` path: files are always served through
	// the app's own uploads route (auth + per-user ownership check), never via a
	// direct, public bucket URL.
	save(key: string, data: Uint8Array, mime: string): Promise<string>;
	// Read an object back for the uploads route to stream. Returns a Blob-like body
	// (BunFile / S3File, both consumable by `new Response(...)`) or null when absent.
	read(key: string): Promise<Blob | null>;
	delete(key: string): Promise<void>;
}

export type ImageProcessOptions = {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	format?: "webp";
};
