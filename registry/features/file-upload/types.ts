import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { files } from "./schemas/files.table";

export type FileRecord = InferSelectModel<typeof files>;
export type NewFileRecord = InferInsertModel<typeof files>;

export type StorageDriver = "local" | "s3";

export interface IStorageAdapter {
	save(key: string, data: Uint8Array, mime: string): Promise<string>;
	delete(key: string): Promise<void>;
}

export type ImageProcessOptions = {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	format?: "webp";
};
