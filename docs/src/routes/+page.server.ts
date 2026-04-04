import type { LoadEvent } from "bosia";
import { getVersion } from "$lib/utils";
import { buildSeoMeta } from "$lib/docs/seo";

export const prerender = true;

export async function load({ url }: LoadEvent) {
    const locale = url.pathname.startsWith("/id") ? "id" as const : "en" as const;
    const version = await getVersion();
    return { locale, version, switchLocaleUrl: "/id" };
}

export function metadata() {
    const title = "Bosia — The fullstack framework for Bun + Svelte";
    const description = "Build fast, modern web apps with Bosia. File-based routing, SSR, streaming, and more — powered by Bun and Svelte 5.";
    const seo = buildSeoMeta({ title, description, slug: "", locale: "en" });
    return { title, description, ...seo };
}
