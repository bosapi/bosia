<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";

    let {
        variant = "default",
        class: className = "",
        children,
        ...restProps
    }: {
        variant?: "default" | "icon" | "image";
        class?: string;
        children?: Snippet;
        [key: string]: any;
    } = $props();

    const variantClasses = {
        default: "flex shrink-0 items-center justify-center",
        icon: "flex shrink-0 items-center justify-center size-10 rounded-md bg-muted",
        image: "flex shrink-0 overflow-hidden rounded-md",
    };
</script>

<div class={cn(variantClasses[variant], className)} {...restProps}>
    {@render children?.()}
</div>
