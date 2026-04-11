<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";

    type PaginationLinkSize = "default" | "sm" | "lg" | "icon";

    let {
        href = "#",
        isActive = false,
        disabled = false,
        size = "icon" as PaginationLinkSize,
        class: className = "",
        children,
        ...restProps
    }: {
        href?: string;
        isActive?: boolean;
        disabled?: boolean;
        size?: PaginationLinkSize;
        class?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    const sizeClasses: Record<PaginationLinkSize, string> = {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
    };

    const variantClass = $derived(
        isActive
            ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            : "hover:bg-accent hover:text-accent-foreground",
    );
</script>

<a
    {href}
    aria-current={isActive ? "page" : undefined}
    aria-disabled={disabled ? "true" : undefined}
    data-disabled={disabled ? "" : undefined}
    tabindex={disabled ? -1 : undefined}
    class={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled && "pointer-events-none opacity-50",
        variantClass,
        sizeClasses[size],
        className,
    )}
    {...restProps}
>
    {@render children?.()}
</a>
