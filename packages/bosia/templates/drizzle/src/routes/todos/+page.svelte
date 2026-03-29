<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import { TodoForm, TodoList } from "$lib/components/todo";

    let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
    <title>Todos</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-background text-foreground">
    <header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <nav class="mx-auto flex max-w-2xl items-center gap-6 px-4 py-3">
            <a href="/" class="font-bold tracking-tight flex items-center gap-2">
                <img src="/favicon.svg" alt="" class="size-5" />
                Todos
            </a>
            <a href="/" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</a>
            <a href="/api/todos" target="_blank" class="text-sm text-muted-foreground hover:text-foreground transition-colors">API</a>
        </nav>
    </header>

    <main class="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div class="space-y-6">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Todos</h1>
                <p class="mt-1 text-sm text-muted-foreground">A full-stack CRUD demo with Drizzle ORM</p>
            </div>

            <TodoForm error={form?.error} />
            <TodoList todos={data.todos} />
        </div>
    </main>

    <footer class="border-t py-4 text-center text-sm text-muted-foreground">
        Powered by Bosia
    </footer>
</div>
