import type { RequestEvent } from "bosia";
import { realpath } from "node:fs/promises";
import { join, sep } from "node:path";
import matter from "gray-matter";
import { SKILLS_ROOT, listSkills } from "$lib/skills/list";

const NAME_RE = /^[a-z0-9-]+$/;

export const prerender = true;

export async function entries(): Promise<{ name: string }[]> {
	const skills = await listSkills();
	return skills.map((s) => ({ name: s.name }));
}

export async function GET({ params }: RequestEvent) {
	const name = params.name;
	if (!name || !NAME_RE.test(name)) {
		return new Response("bad name", { status: 400 });
	}
	const file = join(SKILLS_ROOT, name, "SKILL.md");
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
	const raw = await Bun.file(real).text();
	const { content } = matter(raw);
	return Response.json({ name, content }, { headers: { "cache-control": "public, max-age=60" } });
}
