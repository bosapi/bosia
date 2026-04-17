import { twMerge } from "tailwind-merge";

type ClassDictionary = Record<string, any>;
type ClassArray = ClassValue[];
type ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined;

function clsx(...inputs: ClassValue[]): string {
    let str = '';
    for (const input of inputs) {
        if (!input) continue;
        if (typeof input === 'string' || typeof input === 'number') {
            str && (str += ' ');
            str += input;
        } else if (Array.isArray(input)) {
            const inner = clsx(...input);
            if (inner) { str && (str += ' '); str += inner; }
        } else if (typeof input === 'object') {
            for (const k in input) {
                if ((input as ClassDictionary)[k]) { str && (str += ' '); str += k; }
            }
        }
    }
    return str;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function getVersion(): Promise<string> {
    try {
        const f = Bun.file("../packages/bosia/package.json");
        const json = await f.json();
        return `v${json.version}`;
    } catch {
        return "v0.1.2";
    }
}
