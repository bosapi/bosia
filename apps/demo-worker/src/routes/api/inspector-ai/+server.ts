import type { RequestEvent } from "bosia";

interface InspectorPayload {
	file: string;
	line: number;
	col: number;
	comment: string;
}

export async function POST({ request }: RequestEvent) {
	const body = (await request.json().catch(() => ({}))) as Partial<InspectorPayload>;
	const { file, line, col, comment } = body;

	console.log("\n──── 🪲 inspector AI handoff ─────────────────────────────");
	console.log(`  📄 ${file}:${line}:${col}`);
	console.log(`  💬 ${comment}`);
	console.log("──────────────────────────────────────────────────────────\n");

	return Response.json({
		ok: true,
		echoed: { file, line, col, comment },
		note: "Demo stub. Wire this to your coding agent (Claude Code, Cursor CLI, etc.) to apply fixes automatically.",
	});
}
