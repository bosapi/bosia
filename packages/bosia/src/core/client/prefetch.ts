// ─── Link Prefetching ─────────────────────────────────────
// Supports `data-bosia-preload="hover"` and `data-bosia-preload="viewport"`
// on <a> elements or their ancestors.

/** Builds the `/__bosia/data/…` URL for a given client path. */
export function dataUrl(path: string): string {
    const url = new URL(path, window.location.origin);
    let p = url.pathname.replace(/\/$/, "");
    return `/__bosia/data${p || "/index"}.json${url.search}`;
}

export const prefetchCache = new Map<string, any>();

// In-flight fetch deduplication
const pending = new Set<string>();

/** Returns cached prefetch data for a path and removes it from cache. */
export function consumePrefetch(path: string): any | null {
    const data = prefetchCache.get(path);
    if (data === undefined) return null;
    prefetchCache.delete(path);
    return data;
}

/** Prefetches data for a path and stores in cache. No-op if already cached/in-flight. */
export async function prefetchPath(path: string): Promise<void> {
    if (prefetchCache.has(path)) return;
    if (pending.has(path)) return;

    pending.add(path);
    try {
        const res = await fetch(dataUrl(path));
        if (res.ok) {
            prefetchCache.set(path, await res.json());
        }
    } catch {
        // Silently ignore — prefetch is best-effort
    } finally {
        pending.delete(path);
    }
}

function getLinkHref(anchor: HTMLAnchorElement): string | null {
    if (anchor.origin !== window.location.origin) return null;
    if (anchor.target) return null;
    if (anchor.hasAttribute("download")) return null;
    return anchor.pathname + anchor.search;
}

function observeViewportLinks(container: Element | Document = document) {
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const anchor = entry.target as HTMLAnchorElement;
            const href = getLinkHref(anchor);
            if (href) prefetchPath(href);
            observer.unobserve(anchor);
        }
    }, { rootMargin: "0px" });

    const links = (container === document ? document : container as Element)
        .querySelectorAll<HTMLAnchorElement>("a[data-bosia-preload='viewport']");

    for (const link of links) {
        observer.observe(link);
    }

    return observer;
}

export function initPrefetch(): void {
    // ── Hover strategy (event delegation, 20ms debounce) ─────
    let hoverTimer: ReturnType<typeof setTimeout> | null = null;

    document.addEventListener("mouseover", (e) => {
        if (!(e.target instanceof Element)) return;
        // Early exit: skip if no [data-bosia-preload="hover"] ancestor exists
        const preloadEl = e.target.closest("[data-bosia-preload]");
        if (!preloadEl || preloadEl.getAttribute("data-bosia-preload") !== "hover") return;
        const anchor = e.target.closest("a") as HTMLAnchorElement | null;
        if (!anchor) return;
        const href = getLinkHref(anchor);
        if (!href) return;

        if (hoverTimer) clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => prefetchPath(href), 100);
    });

    document.addEventListener("mouseout", () => {
        if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
    });

    // ── Viewport strategy ─────────────────────────────────────
    const observer = observeViewportLinks();

    // Pick up links added after initial render (e.g., after client navigation)
    const mutation = new MutationObserver((records) => {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (!(node instanceof Element)) continue;
                // The node itself might be a viewport link
                if (node.matches("a[data-bosia-preload='viewport']")) {
                    observer.observe(node as HTMLAnchorElement);
                }
                // Or it might contain viewport links
                for (const link of node.querySelectorAll<HTMLAnchorElement>(
                    "a[data-bosia-preload='viewport']"
                )) {
                    observer.observe(link);
                }
            }
        }
    });

    mutation.observe(document.body, { childList: true, subtree: true });
}
