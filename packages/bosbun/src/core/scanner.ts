import { readdirSync, existsSync } from "fs";
import { join } from "path";
import type { PageRoute, ApiRoute, RouteManifest } from "./types.ts";

// ─── Route Scanner ───────────────────────────────────────
// Walks src/routes/ and produces a RouteManifest.
//
// Conventions (SvelteKit-compatible):
//   +page.svelte         — page component
//   +page.server.ts      — server loader for the page
//   +layout.svelte       — layout component (wraps all children)
//   +layout.server.ts    — server loader for the layout
//   +server.ts           — API route (GET, POST, etc.)
//   (group)/             — route group: invisible in URL, shares layouts
//   [param]/             — dynamic segment
//   [...rest]/           — catch-all segment

const ROUTES_DIR = "./src/routes";

export function scanRoutes(): RouteManifest {
    const pages: PageRoute[] = [];
    const apis: ApiRoute[] = [];

    function walk(
        dir: string,
        urlSegments: string[],
        layoutChain: string[],
        layoutServerChain: { path: string; depth: number }[],
    ) {
        const fullDir = join(ROUTES_DIR, dir);
        if (!existsSync(fullDir)) return;

        const items = readdirSync(fullDir, { withFileTypes: true });

        // Accumulate layouts for this level
        const currentLayouts = [...layoutChain];
        const currentLayoutServers = [...layoutServerChain];

        if (items.some(i => i.isFile() && i.name === "+layout.svelte")) {
            currentLayouts.push(join(dir, "+layout.svelte"));
        }
        if (items.some(i => i.isFile() && i.name === "+layout.server.ts")) {
            currentLayoutServers.push({
                path: join(dir, "+layout.server.ts"),
                depth: currentLayouts.length - 1,
            });
        }

        // API route (+server.ts)
        if (items.some(i => i.isFile() && i.name === "+server.ts")) {
            apis.push({
                pattern: toUrlPath(urlSegments),
                server: join(dir, "+server.ts"),
            });
        }

        // Page route (+page.svelte)
        if (items.some(i => i.isFile() && i.name === "+page.svelte")) {
            const pageServerFile = items.some(i => i.isFile() && i.name === "+page.server.ts")
                ? join(dir, "+page.server.ts")
                : null;

            pages.push({
                pattern: toUrlPath(urlSegments),
                page: join(dir, "+page.svelte"),
                layouts: [...currentLayouts],
                pageServer: pageServerFile,
                layoutServers: [...currentLayoutServers],
            });
        }

        // Recurse into subdirectories
        for (const entry of items) {
            if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules") continue;

            const dirName = entry.name;
            // Route groups like (public), (auth) are invisible in URLs
            const isGroup = /^\(.*\)$/.test(dirName);

            walk(
                dir ? join(dir, dirName) : dirName,
                isGroup ? [...urlSegments] : [...urlSegments, dirName],
                currentLayouts,
                currentLayoutServers,
            );
        }
    }

    walk("", [], [], []);

    const errorPage = existsSync(join(ROUTES_DIR, "+error.svelte")) ? "+error.svelte" : null;

    return { pages, apis, errorPage };
}

function toUrlPath(segments: string[]): string {
    if (segments.length === 0) return "/";
    return "/" + segments.join("/");
}
