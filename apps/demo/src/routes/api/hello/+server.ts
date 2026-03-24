import type { RequestEvent } from "bosbun";

export function GET({ params, locals }: RequestEvent) {
    return Response.json({
        method: "GET",
        message: "Hello from Bosbun API!",
        params,
        locals: {
            requestTime: locals.requestTime ?? null,
            user: locals.user ?? null,
        },
    });
}

export async function POST({ request, locals }: RequestEvent) {
    const body = await request.json().catch(() => ({}));
    return Response.json({ method: "POST", received: body, locals });
}

export async function PUT({ request, locals }: RequestEvent) {
    const body = await request.json().catch(() => ({}));
    return Response.json({ method: "PUT", received: body, locals });
}

export async function PATCH({ request, locals }: RequestEvent) {
    const body = await request.json().catch(() => ({}));
    return Response.json({ method: "PATCH", received: body, locals });
}

export function DELETE({ params, locals }: RequestEvent) {
    return Response.json({ method: "DELETE", deleted: true, params, locals });
}

export function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            Allow: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
