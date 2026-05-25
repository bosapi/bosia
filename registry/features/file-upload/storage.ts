import type { IStorageAdapter, StorageDriver } from "../types";
import { LocalStorage } from "./local.storage";
import { S3Storage } from "./s3.storage";

let cached: IStorageAdapter | null = null;

export function getStorage(): IStorageAdapter {
	if (cached) return cached;
	const driver = (process.env.STORAGE_DRIVER ?? "local") as StorageDriver;
	cached = driver === "s3" ? new S3Storage() : new LocalStorage();
	return cached;
}
