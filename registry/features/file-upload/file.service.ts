import { FileRepository } from "./file.repository";
import { getStorage } from "./storage";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/avif"]);
const MAX = { width: 1920, height: 1080, quality: 85 } as const;

function fitInside(srcW: number, srcH: number, maxW: number, maxH: number) {
	if (srcW <= maxW && srcH <= maxH) return { width: srcW, height: srcH };
	const ratio = Math.min(maxW / srcW, maxH / srcH);
	return { width: Math.round(srcW * ratio), height: Math.round(srcH * ratio) };
}

export class FileService {
	static async upload(file: File, userId: string) {
		if (!ALLOWED.has(file.type)) {
			throw new Error(`Unsupported type: ${file.type || "unknown"}`);
		}

		const bytes = new Uint8Array(await file.arrayBuffer());
		const img = new Bun.Image(bytes);
		const { width: srcW, height: srcH } = await img.metadata();
		const target = fitInside(srcW, srcH, MAX.width, MAX.height);
		const out = await img
			.resize(target.width, target.height, { fit: "inside" })
			.webp({ quality: MAX.quality })
			.bytes();

		const key = `${crypto.randomUUID()}.webp`;
		const url = await getStorage().save(key, out, "image/webp");

		const [row] = await FileRepository.create({
			userId,
			key,
			url,
			mime: "image/webp",
			size: out.byteLength,
			width: target.width,
			height: target.height,
		});
		return row;
	}

	static getAll(userId: string) {
		return FileRepository.getAllByUser(userId);
	}

	static getByKey(key: string) {
		return FileRepository.getByKey(key);
	}

	static async remove(id: string, userId: string) {
		const record = await FileRepository.getOwned(id, userId);
		if (!record) throw new Error("Not found");
		await getStorage().delete(record.key);
		const [row] = await FileRepository.remove(id, userId);
		return row;
	}
}
