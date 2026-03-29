import type { LoadEvent } from "bosia";

export async function load({ locals }: LoadEvent) {
    return {
        appName: "{{PROJECT_NAME}}",
        requestTime: locals.requestTime as number | null ?? null,
    };
}
