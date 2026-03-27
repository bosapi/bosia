import { error } from "bosia";
import type { LoadEvent } from "bosia";
import { loadDoc } from "$lib/docs/content";
import { getLocale, stripLocale } from "$lib/docs/i18n";

export async function load({ params, url }: LoadEvent) {
    const slug = params.slug || "";
    const locale = getLocale(slug);
    const bareSlug = stripLocale(slug);

    const page = await loadDoc(slug);

    if (!page) {
        error(404, "Not found");
    }

    return {
        html: page.html,
        headings: page.headings,
        frontmatter: page.frontmatter,
        currentSlug: bareSlug,
        locale,
    };
}

export function metadata({ params }: { params: Record<string, string> }) {
    return {
        title: `Bosia Docs`,
    };
}
