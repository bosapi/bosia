import type { RequestEvent } from "bosia";
import { realpath } from "node:fs/promises";
import { join, sep } from "node:path";
import { SKILLS_ROOT, listSkills, listSkillReferences } from "$lib/skills/list";

const NAME_RE = /^[a-z0-9-]+$/;

export const prerender = true;

export async function entries(): Promise<{ name: string; file: string }[]> {
	const skills = await listSkills();
	const out: { name: string; file: string }[] = [];
	for (const skill of skills) {
		const refs = await listSkillReferences(skill.name);
		for (const ref of refs) {
			out.push({ name: skill.name, file: ref.file.slice(0, -3) });
		}
	}
	return out;
}

export async function GET({ params }: RequestEvent) {
	const name = params.name;
	const fileSlug = params.file;
	if (!name || !NAME_RE.test(name)) {
		return new Response("bad name", { status: 400 });
	}
	if (!fileSlug || !NAME_RE.test(fileSlug)) {
		return new Response("bad file", { status: 400 });
	}
	const file = join(SKILLS_ROOT, name, "references", `${fileSlug}.md`);
	let real: string;
	let root: string;
	try {
		real = await realpath(file);
		root = await realpath(SKILLS_ROOT);
	} catch {
		return new Response("not found", { status: 404 });
	}
	if (real !== root && !real.startsWith(root + sep)) {
		return new Response("not found", { status: 404 });
	}
	const content = await Bun.file(real).text();
	return Response.json(
		{
			name,
			file: `${fileSlug}.md`,
			path: `/api/skills/${name}/references/${fileSlug}.json`,
			content,
		},
		{ headers: { "cache-control": "public, max-age=60" } },
	);
}
