import type { LoadEvent } from "bosia";
import { sidebar } from "$lib/docs/nav";
import { getLocale, switchLocaleUrl } from "$lib/docs/i18n";

async function getVersion(): Promise<string> {
    try {
        const f = Bun.file("../packages/bosia/package.json");
        const json = await f.json();
        return `v${json.version}`;
    } catch {
        return "v0.1.1";
    }
}

export async function load({ url }: LoadEvent) {
    const slug = url.pathname === "/" ? "" : url.pathname.replace(/^\//, "").replace(/\/$/, "");
    const locale = getLocale(slug);
    const switchUrl = switchLocaleUrl(slug);
    const version = await getVersion();

    return {
        sidebar,
        locale,
        version,
        switchLocaleUrl: switchUrl.url,
    };
}
