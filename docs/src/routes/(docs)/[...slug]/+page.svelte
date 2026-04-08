<script lang="ts">
    import TableOfContents from "$lib/components/TableOfContents.svelte";
    import ComponentPreview from "$lib/components/ComponentPreview.svelte";

    // Demo component map
    import ButtonDemo from "$lib/components/demos/ButtonDemo.svelte";
    import BadgeDemo from "$lib/components/demos/BadgeDemo.svelte";
    import CardDemo from "$lib/components/demos/CardDemo.svelte";
    import InputDemo from "$lib/components/demos/InputDemo.svelte";
    import AvatarDemo from "$lib/components/demos/AvatarDemo.svelte";
    import SeparatorDemo from "$lib/components/demos/SeparatorDemo.svelte";
    import DropdownMenuDemo from "$lib/components/demos/DropdownMenuDemo.svelte";
    import ChartDemo from "$lib/components/demos/ChartDemo.svelte";
    import DataTableDemo from "$lib/components/demos/DataTableDemo.svelte";
    import NavbarDemo from "$lib/components/demos/NavbarDemo.svelte";
    import SidebarDemo from "$lib/components/demos/SidebarDemo.svelte";
    import LabelDemo from "$lib/components/demos/LabelDemo.svelte";
    import IconGrid from "$lib/components/IconGrid.svelte";

    const demos: Record<string, any> = {
        ButtonDemo,
        BadgeDemo,
        CardDemo,
        InputDemo,
        AvatarDemo,
        SeparatorDemo,
        DropdownMenuDemo,
        ChartDemo,
        DataTableDemo,
        NavbarDemo,
        SidebarDemo,
        LabelDemo,
        IconGrid,
    };

    let { data }: { data: any } = $props();

    const demo = $derived(data.frontmatter?.demo ? demos[data.frontmatter.demo] : null);
</script>

<div class="flex gap-8">
    <div class="min-w-0 flex-1">
        <!-- Page header -->
        <div class="mb-6">
            <h1 class="text-3xl font-bold tracking-tight">{data.frontmatter.title}</h1>
            {#if data.frontmatter.description}
                <p class="mt-2 text-lg text-muted-foreground">{data.frontmatter.description}</p>
            {/if}
        </div>

        <!-- Component demo preview -->
        {#if demo}
            <ComponentPreview demoCode={data.demoCode}>
                {@const DemoComponent = demo}
                <DemoComponent />
            </ComponentPreview>
        {/if}

        <!-- Rendered markdown -->
        <div class="prose">
            {@html data.html}
        </div>
    </div>

    <!-- Table of Contents (desktop) -->
    <aside class="hidden w-48 shrink-0 xl:block">
        <div class="sticky top-16 py-6">
            <TableOfContents headings={data.headings} />
        </div>
    </aside>
</div>
