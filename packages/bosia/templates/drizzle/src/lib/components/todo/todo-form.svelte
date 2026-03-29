<script lang="ts">
    let { error }: { error?: string } = $props();
</script>

<form method="POST" action="?/create" class="flex gap-2">
    <input
        name="title"
        type="text"
        placeholder="What needs to be done?"
        required
        class="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
    <button
        type="submit"
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
    >
        Add
    </button>
</form>

{#if error}
    <p class="mt-2 text-sm text-destructive">{error}</p>
{/if}
