import type { LoadEvent } from "bosbun";

// Data returned here is available to all child loaders via parent()
// and to all layouts via the `data` prop.
export async function load({ locals }: LoadEvent) {
    return {
        appName: "Bosbun Demo",
        requestTime: locals.requestTime as number | null ?? null,
    };
}
