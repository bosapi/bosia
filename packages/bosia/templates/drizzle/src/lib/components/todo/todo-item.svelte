<script lang="ts">
    import type { Todo } from "../../../features/todo/types";

    let { todo }: { todo: Todo } = $props();
    let editing = $state(false);
    let editTitle = $state(todo.title);
</script>

<li class="group flex items-center gap-3 rounded-md border border-border px-4 py-3 transition-colors hover:bg-accent/50">
    <!-- Toggle -->
    <form method="POST" action="?/toggle">
        <input type="hidden" name="id" value={todo.id} />
        <input type="hidden" name="completed" value={String(!todo.completed)} />
        <button
            type="submit"
            class="flex size-5 items-center justify-center rounded border border-input transition-colors hover:border-primary {todo.completed ? 'bg-primary border-primary' : ''}"
            aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
        >
            {#if todo.completed}
                <svg class="size-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            {/if}
        </button>
    </form>

    <!-- Title / Edit -->
    {#if editing}
        <form method="POST" action="?/update" class="flex flex-1 gap-2" onsubmit={() => (editing = false)}>
            <input type="hidden" name="id" value={todo.id} />
            <input
                name="title"
                type="text"
                bind:value={editTitle}
                required
                class="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button type="submit" class="text-sm text-primary hover:underline">Save</button>
            <button type="button" class="text-sm text-muted-foreground hover:underline" onclick={() => { editing = false; editTitle = todo.title; }}>Cancel</button>
        </form>
    {:else}
        <span
            class="flex-1 text-sm {todo.completed ? 'line-through text-muted-foreground' : ''}"
            ondblclick={() => (editing = true)}
        >
            {todo.title}
        </span>
    {/if}

    <!-- Delete -->
    <form method="POST" action="?/delete">
        <input type="hidden" name="id" value={todo.id} />
        <button
            type="submit"
            class="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
            aria-label="Delete todo"
        >
            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </form>
</li>
