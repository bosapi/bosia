import { FileRepository } from "./file.repository";
import { getStorage } from "./storage";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/avif"]);
const MAX = { width: 1920, height: 1080, quality: 0.85 } as const;

type BunImageModule = {
	Image?: {
		open?: (data: Uint8Array) => Promise<BunImageInstance>;
		decode?: (data: Uint8Array) => Promise<BunImageInstance>;
	};
};

interface BunImageInstance {
	width: number;
	height: number;
	resize: (opts: { width: number; height: number; fit?: string }) => BunImageInstance;
	encode: (opts: { format: string; quality?: number }) => Promise<Uint8Array>;
}

async function decodeImage(bytes: Uint8Array): Promise<BunImageInstance> {
	const api = (Bun as unknown as BunImageModule).Image;
	if (!api) throw new Error("Bun.Image API not available — upgrade Bun");
	const opener = api.open ?? api.decode;
	if (!opener) throw new Error("Bun.Image has no open()/decode() entry point");
	return opener(bytes);
}

function fitInside(srcW: number, srcH: number, maxW: number, maxH: number) {
	if (srcW <= maxW && srcH <= maxH) return { width: srcW, height: srcH };
	const ratio = Math.min(maxW / srcW, maxH / srcH);
	return { width: Math.round(srcW * ratio), height: Math.round(srcH * ratio) };
}

export class FileService {
	static async upload(file: File) {
		if (!ALLOWED.has(file.type)) {
			throw new Error(`Unsupported type: ${file.type || "unknown"}`);
		}

		const bytes = new Uint8Array(await file.arrayBuffer());
		const img = await decodeImage(bytes);
		const target = fitInside(img.width, img.height, MAX.width, MAX.height);
		const resized = img.resize({ width: target.width, height: target.height, fit: "inside" });
		const out = await resized.encode({ format: "webp", quality: MAX.quality });

		const key = `${crypto.randomUUID()}.webp`;
		const url = await getStorage().save(key, out, "image/webp");

		const [row] = await FileRepository.create({
			key,
			url,
			mime: "image/webp",
			size: out.byteLength,
			width: resized.width,
			height: resized.height,
		});
		return row;
	}

	static getAll() {
		return FileRepository.getAll();
	}

	static async remove(id: string) {
		const record = await FileRepository.getById(id);
		if (!record) throw new Error("Not found");
		await getStorage().delete(record.key);
		const [row] = await FileRepository.remove(id);
		return row;
	}
}
