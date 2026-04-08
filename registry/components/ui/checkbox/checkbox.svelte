<script lang="ts">
    import { cn } from "$lib/utils.ts";

    let {
        checked = $bindable(false),
        indeterminate = false,
        disabled = false,
        id = undefined as string | undefined,
        name = undefined as string | undefined,
        value = undefined as string | undefined,
        class: className = "",
        ...restProps
    }: {
        checked?: boolean;
        indeterminate?: boolean;
        disabled?: boolean;
        id?: string;
        name?: string;
        value?: string;
        class?: string;
        [key: string]: any;
    } = $props();

    const dataState = $derived(
        indeterminate ? "indeterminate" : checked ? "checked" : "unchecked",
    );

    function toggle() {
        if (disabled) return;
        checked = !checked;
    }

    function onkeydown(e: KeyboardEvent) {
        if (e.key === " ") {
            e.preventDefault();
            toggle();
        }
    }
</script>

<button
    type="button"
    role="checkbox"
    aria-checked={indeterminate ? "mixed" : checked}
    data-state={dataState}
    {disabled}
    {id}
    class={cn(
        "peer size-4 shrink-0 rounded-sm border border-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        className,
    )}
    onclick={toggle}
    {onkeydown}
    {...restProps}
>
    {#if indeterminate}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            class="size-full p-px"
        >
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    {:else if checked}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-full p-px"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    {/if}
</button>

{#if name}
    <input
        type="checkbox"
        {name}
        {value}
        checked={checked}
        {disabled}
        tabindex="-1"
        aria-hidden="true"
        class="sr-only"
    />
{/if}
