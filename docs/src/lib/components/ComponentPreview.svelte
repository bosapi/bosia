<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        children,
        demoCode = null,
        class: className = "",
    }: { children: Snippet; demoCode?: string | null; class?: string } = $props();

    let activeTab = $state<"preview" | "code">("preview");
</script>

<div class="preview-wrapper {className}">
    {#if demoCode}
        <div class="tab-bar">
            <button
                class="tab-btn"
                class:active={activeTab === "preview"}
                onclick={() => (activeTab = "preview")}
            >
                Preview
            </button>
            <button
                class="tab-btn"
                class:active={activeTab === "code"}
                onclick={() => (activeTab = "code")}
            >
                Code
            </button>
        </div>
    {/if}

    <div class:has-tabs={!!demoCode}>
        {#if activeTab === "preview"}
            <div class="bosia-preview not-content preview-container">
                {@render children()}
            </div>
        {:else}
            <div class="code-container">
                {@html demoCode}
            </div>
        {/if}
    </div>
</div>

<style>
    .preview-wrapper {
        border: 1px solid hsl(var(--border));
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
    }

    /* ── Tab bar ─────────────────────────────────────────────── */
    .tab-bar {
        display: flex;
        gap: 0;
        border-bottom: 1px solid hsl(var(--border));
        background-color: hsl(var(--muted) / 0.4);
        padding: 0 0.75rem;
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
        overflow: hidden;
    }

    .tab-btn {
        padding: 0.5rem 0.875rem;
        font-size: 0.8125rem;
        font-weight: 500;
        color: hsl(var(--muted-foreground));
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        cursor: pointer;
        transition: color 0.15s, border-color 0.15s;
    }

    .tab-btn:hover {
        color: hsl(var(--foreground));
    }

    .tab-btn.active {
        color: hsl(var(--foreground));
        border-bottom-color: hsl(var(--foreground));
    }

    /* ── Preview panel ───────────────────────────────────────── */
    .preview-container {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 2rem;
        min-height: 80px;
        border-radius: inherit;
    }

    .has-tabs .preview-container {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    /* ── Code panel ──────────────────────────────────────────── */
    .code-container {
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
        overflow: hidden;
    }

    .code-container :global(pre.shiki) {
        margin: 0;
        border-radius: 0;
        padding: 1.25rem 1.5rem;
        font-size: 0.8125rem;
        line-height: 1.65;
        overflow-x: auto;
        max-height: 480px;
    }
</style>
