<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { TableRow, TableCell } from "../table";

    let {
        colspan = 1,
        message = "No results found.",
        class: className = "",
    }: {
        colspan?: number;
        message?: string;
        class?: string;
    } = $props();
</script>

<TableRow>
    <TableCell
        {colspan}
        class={cn(
            "h-32 text-center text-sm text-muted-foreground",
            className,
        )}
    >
        <div class="flex flex-col items-center justify-center gap-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-muted-foreground/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
            </svg>
            <span>{message}</span>
        </div>
    </TableCell>
</TableRow>
