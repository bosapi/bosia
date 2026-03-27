import type { RequestEvent } from "bosia";

// GET /api/registry/components/ui/button/meta.json
// GET /api/registry/components/ui/button/button.svelte
// GET /api/registry/components/ui/button/index.ts

const REGISTRY_COMPONENTS_BASE = "../registry/components";

const MIME: Record<string, string> = {
    json: "application/json",
    svelte: "text/plain; charset=utf-8",
    ts: "text/plain; charset=utf-8",
    js: "text/javascript; charset=utf-8",
    css: "text/css; charset=utf-8",
};

export async function GET({ params }: RequestEvent) {
    const rawPath = params.path ?? "";

    // Path traversal protection: reject any segment containing ".."
    if (rawPath.split("/").some((seg) => seg === ".." || seg === ".")) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const filePath = `${REGISTRY_COMPONENTS_BASE}/${rawPath}`;
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    const ext = rawPath.split(".").pop() ?? "";
    const contentType = MIME[ext] ?? "application/octet-stream";

    return new Response(file, {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=60",
        },
    });
}
