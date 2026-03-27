import { Marked } from "marked";
import matter from "gray-matter";

let highlighter: any = null;

async function getHighlighter() {
    if (highlighter) return highlighter;
    const { createHighlighter } = await import("shiki");
    highlighter = await createHighlighter({
        themes: ["github-light", "github-dark"],
        langs: ["svelte", "typescript", "bash", "json", "css", "html"],
    });
    return highlighter;
}

export interface DocPage {
    frontmatter: Record<string, any>;
    html: string;
    headings: { id: string; text: string; level: number }[];
}

export async function parseMarkdown(raw: string): Promise<DocPage> {
    const { data: frontmatter, content } = matter(raw);
    const hl = await getHighlighter();
    const headings: DocPage["headings"] = [];

    const marked = new Marked();

    marked.use({
        renderer: {
            heading({ text, depth }: { text: string; depth: number }) {
                const id = text
                    .toLowerCase()
                    .replace(/<[^>]*>/g, "")
                    .replace(/[^\w\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-")
                    .trim();
                if (depth >= 2 && depth <= 4) {
                    headings.push({ id, text: text.replace(/<[^>]*>/g, ""), level: depth });
                }
                return `<h${depth} id="${id}">${text}</h${depth}>`;
            },
            code({ text, lang }: { text: string; lang?: string }) {
                const language = lang || "text";
                try {
                    const supported = ["svelte", "typescript", "ts", "bash", "json", "css", "html", "sh"];
                    if (supported.includes(language)) {
                        const mapped = language === "ts" ? "typescript" : language === "sh" ? "bash" : language;
                        return hl.codeToHtml(text, {
                            lang: mapped,
                            themes: { light: "github-light", dark: "github-dark" },
                            defaultColor: false,
                        });
                    }
                } catch (err) {
                    console.error(`Syntax highlighting failed for language "${language}":`, err);
                }
                return `<pre><code class="language-${language}">${escapeHtml(text)}</code></pre>`;
            },
        },
    });

    const html = await marked.parse(content);

    return { frontmatter, html, headings };
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
