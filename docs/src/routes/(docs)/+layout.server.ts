import type { LoadEvent } from "bosia";
import { sidebar } from "$lib/docs/nav";
import { getLocale, switchLocaleUrl } from "$lib/docs/i18n";
import { getVersion } from "$lib/utils";

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
