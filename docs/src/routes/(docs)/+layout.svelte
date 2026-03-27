<script lang="ts">
    import DocsNavbar from "$lib/components/DocsNavbar.svelte";
    import DocsSidebar from "$lib/components/DocsSidebar.svelte";

    let { children, data }: { children: any; data: any } = $props();
    let mobileOpen = $state(false);

    function closeMobile() {
        mobileOpen = false;
    }
</script>

<svelte:head>
    <script>
        // Restore theme before paint
        if (localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add("dark");
        }
    </script>
</svelte:head>

<div class="min-h-screen">
    <DocsNavbar
        version={data.version}
        locale={data.locale}
        switchLocaleUrl={data.switchLocaleUrl}
        onMenuToggle={() => (mobileOpen = !mobileOpen)}
    />

    <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <div class="flex gap-8">
            <!-- Desktop sidebar -->
            <aside class="hidden w-56 shrink-0 lg:block">
                <div class="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-6 pr-2">
                    <DocsSidebar
                        groups={data.sidebar}
                        currentSlug={data.currentSlug ?? ""}
                        locale={data.locale}
                    />
                </div>
            </aside>

            <!-- Main content -->
            <main class="min-w-0 flex-1 py-6">
                {@render children()}
            </main>
        </div>
    </div>
</div>

<!-- Mobile sidebar overlay -->
{#if mobileOpen}
    <div class="fixed inset-0 z-50 lg:hidden">
        <!-- Backdrop -->
        <button
            class="absolute inset-0 bg-black/50"
            onclick={closeMobile}
            aria-label="Close menu"
        ></button>
        <!-- Panel -->
        <div class="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-background p-6 shadow-lg">
            <DocsSidebar
                groups={data.sidebar}
                currentSlug={data.currentSlug ?? ""}
                locale={data.locale}
                onnavigate={closeMobile}
            />
        </div>
    </div>
{/if}
