import type { RequestEvent } from "bosia";

// GET /api/registry/index → serves registry/index.json

const indexFile = Bun.file("../registry/index.json");

export async function GET(_event: RequestEvent) {
    if (!(await indexFile.exists())) {
        return Response.json({ error: "Registry index not found" }, { status: 404 });
    }

    const text = await indexFile.text();
    return new Response(text, {
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=60",
        },
    });
}
