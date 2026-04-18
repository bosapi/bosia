<script lang="ts">
    import { cn } from "$lib/utils.ts";
    import type { Snippet } from "svelte";

    let {
        variant = "default",
        size = "default",
        class: className = "",
        children,
        child,
        ...restProps
    }: {
        variant?: "default" | "outline" | "muted";
        size?: "default" | "sm";
        class?: string;
        children?: Snippet;
        child?: Snippet<[{ class: string; props: Record<string, any> }]>;
        [key: string]: any;
    } = $props();

    const variantClasses = {
        default: "bg-transparent",
        outline: "border border-input rounded-lg",
        muted: "bg-muted/50 rounded-lg",
    };

    const sizeClasses = {
        default: "gap-3 p-3",
        sm: "gap-2 p-2",
    };

    const classes = $derived(
        cn("flex items-center", variantClasses[variant], sizeClasses[size], className),
    );
</script>

{#if child}
    {@render child({ class: classes, props: restProps })}
{:else}
    <div class={classes} {...restProps}>
        {@render children?.()}
    </div>
{/if}
