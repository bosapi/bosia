import type { LoadEvent } from "bosia";

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
    const locale = url.pathname.startsWith("/id") ? "id" as const : "en" as const;
    const version = await getVersion();
    return { locale, version, switchLocaleUrl: "/id" };
}
