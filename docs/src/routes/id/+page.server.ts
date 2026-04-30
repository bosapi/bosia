import type { LoadEvent } from "bosia";
import { getVersion } from "$lib/utils";
import { buildSeoMeta } from "$lib/docs/seo";

export async function load({ url }: LoadEvent) {
	const locale = "id" as const;
	const version = await getVersion();
	return { locale, version, switchLocaleUrl: "/" };
}

export function metadata() {
	const title = "Bosia — Framework fullstack untuk Bun + Svelte";
	const description =
		"Bangun aplikasi web modern dan cepat dengan Bosia. Routing berbasis file, SSR, streaming, dan lainnya — didukung oleh Bun dan Svelte 5.";
	const seo = buildSeoMeta({ title, description, slug: "", locale: "id" });
	return { title, description, ...seo };
}
