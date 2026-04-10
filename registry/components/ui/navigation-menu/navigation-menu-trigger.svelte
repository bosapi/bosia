<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import { getContext } from "svelte";
    import type { Snippet } from "svelte";

    let {
        class: className = "",
        children,
        ...restProps
    }: {
        class?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    const nav = getContext<{
        value: string | null;
        open: (id: string) => void;
        scheduleClose: (id: string) => void;
        cancelClose: () => void;
        closeAll: () => void;
        setValue: (v: string | null) => void;
    }>("navigation-menu");

    const item = getContext<{ id: string }>("navigation-menu-item");
    const id = item?.id ?? "";

    const isOpen = $derived(nav?.value === id);

    function handleClick() {
        if (isOpen) nav?.closeAll();
        else nav?.setValue(id);
    }

    function focusFirstLink() {
        queueMicrotask(() => {
            const panel = document.getElementById(`${id}-content`);
            if (!panel) return;
            const target = panel.querySelector<HTMLElement>(
                'a, button, [tabindex]:not([tabindex="-1"])',
            );
            target?.focus();
        });
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            nav?.closeAll();
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!isOpen) nav?.setValue(id);
            focusFirstLink();
        }
    }
</script>

<button
    type="button"
    id={`${id}-trigger`}
    aria-expanded={isOpen}
    aria-controls={`${id}-content`}
    data-state={isOpen ? "open" : "closed"}
    class={cn(
        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50",
        className,
    )}
    onmouseenter={() => nav?.open(id)}
    onfocus={() => nav?.open(id)}
    onclick={handleClick}
    onkeydown={handleKeydown}
    {...restProps}
>
    {@render children?.()}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class={cn(
            "ml-1 h-3 w-3 transition-transform duration-200",
            isOpen && "rotate-180",
        )}
        aria-hidden="true"
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
</button>
