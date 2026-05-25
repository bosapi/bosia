import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { file } from "./schemas/file.table";

export type FileRecord = InferSelectModel<typeof file>;
export type NewFileRecord = InferInsertModel<typeof file>;

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
