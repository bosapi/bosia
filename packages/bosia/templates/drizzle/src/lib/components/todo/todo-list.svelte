<script lang="ts">
    import type { Todo } from "../../../features/todo/types";
    import TodoItem from "./todo-item.svelte";

    let { todos }: { todos: Todo[] } = $props();
</script>

{#if todos.length === 0}
    <div class="rounded-md border border-dashed border-border py-12 text-center">
        <p class="text-muted-foreground">No todos yet. Add one above!</p>
    </div>
{:else}
    <ul class="space-y-2">
        {#each todos as todo (todo.id)}
            <TodoItem {todo} />
        {/each}
    </ul>
    <p class="mt-3 text-xs text-muted-foreground">
        {todos.filter(t => t.completed).length} of {todos.length} completed
    </p>
{/if}
