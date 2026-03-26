export type Granularity = "day" | "week" | "month" | "year";

/** Format a date label based on the chosen granularity. */
export function formatDate(date: Date, granularity: Granularity): string {
    switch (granularity) {
        case "day":
        case "week":
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        case "month":
            return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        case "year":
            return date.getFullYear().toString();
    }
}

/** Format a date for tooltip display. */
export function formatDateFull(date: Date): string {
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/** Compact number format: 1200 → "1.2k", 1500000 → "1.5M". */
export function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}k`;
    return String(n);
}
