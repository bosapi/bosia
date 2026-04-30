const MODIFIER_MAP: Record<string, keyof KeyboardEvent> = {
	ctrl: "ctrlKey",
	control: "ctrlKey",
	shift: "shiftKey",
	alt: "altKey",
	option: "altKey",
	meta: "metaKey",
	cmd: "metaKey",
	"⌘": "metaKey",
	command: "metaKey",
	win: "metaKey",
};

const ALL_MODIFIERS = [...new Set(Object.values(MODIFIER_MAP))] as (keyof KeyboardEvent)[];

export function matchKeys(keys: string[], event: KeyboardEvent): boolean {
	const normalized = keys.map((k) => k.toLowerCase().trim());

	const requiredMods = new Set<keyof KeyboardEvent>();
	let mainKey = "";

	for (const key of normalized) {
		const mod = MODIFIER_MAP[key];
		if (mod) requiredMods.add(mod);
		else mainKey = key;
	}

	for (const mod of ALL_MODIFIERS) {
		if (requiredMods.has(mod) !== !!(event[mod] as boolean)) return false;
	}

	return mainKey ? event.key.toLowerCase() === mainKey : true;
}
