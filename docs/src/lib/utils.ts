import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
