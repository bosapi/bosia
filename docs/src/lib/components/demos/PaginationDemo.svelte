<script lang="ts">
    import {
        Pagination,
        PaginationContent,
        PaginationItem,
        PaginationLink,
        PaginationPrevious,
        PaginationNext,
        PaginationEllipsis,
    } from "$registry/pagination";

    let currentPage = $state(1);
    const totalPages = 10;
    const siblingCount = 1;

    type PageItem = number | "ellipsis-left" | "ellipsis-right";

    const pages: PageItem[] = $derived.by(() => {
        const items: PageItem[] = [];
        const first = 1;
        const last = totalPages;
        const left = Math.max(first + 1, currentPage - siblingCount);
        const right = Math.min(last - 1, currentPage + siblingCount);

        items.push(first);
        if (left > first + 1) items.push("ellipsis-left");
        for (let i = left; i <= right; i++) items.push(i);
        if (right < last - 1) items.push("ellipsis-right");
        if (last > first) items.push(last);
        return items;
    });

    function goTo(page: number) {
        return (event: MouseEvent) => {
            event.preventDefault();
            if (page < 1 || page > totalPages) return;
            currentPage = page;
        };
    }
</script>

<Pagination>
    <PaginationContent>
        <PaginationItem>
            <PaginationPrevious
                href="#"
                disabled={currentPage === 1}
                onclick={goTo(currentPage - 1)}
            />
        </PaginationItem>

        {#each pages as item (item)}
            <PaginationItem>
                {#if typeof item === "number"}
                    <PaginationLink
                        href="#"
                        isActive={currentPage === item}
                        onclick={goTo(item)}
                    >
                        {item}
                    </PaginationLink>
                {:else}
                    <PaginationEllipsis />
                {/if}
            </PaginationItem>
        {/each}

        <PaginationItem>
            <PaginationNext
                href="#"
                disabled={currentPage === totalPages}
                onclick={goTo(currentPage + 1)}
            />
        </PaginationItem>
    </PaginationContent>
</Pagination>
