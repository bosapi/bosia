<script lang="ts">
    import TableOfContents from "$lib/components/TableOfContents.svelte";
    import ComponentPreview from "$lib/components/ComponentPreview.svelte";

    // Demo component map
    import AccordionDemo from "$lib/components/demos/AccordionDemo.svelte";
    import AlertDemo from "$lib/components/demos/AlertDemo.svelte";
    import AlertDialogDemo from "$lib/components/demos/AlertDialogDemo.svelte";
    import ButtonDemo from "$lib/components/demos/ButtonDemo.svelte";
    import BadgeDemo from "$lib/components/demos/BadgeDemo.svelte";
    import BreadcrumbDemo from "$lib/components/demos/BreadcrumbDemo.svelte";
    import CardDemo from "$lib/components/demos/CardDemo.svelte";
    import CommandDemo from "$lib/components/demos/CommandDemo.svelte";
    import InputDemo from "$lib/components/demos/InputDemo.svelte";
    import AvatarDemo from "$lib/components/demos/AvatarDemo.svelte";
    import SeparatorDemo from "$lib/components/demos/SeparatorDemo.svelte";
    import DropdownMenuDemo from "$lib/components/demos/DropdownMenuDemo.svelte";
    import ChartDemo from "$lib/components/demos/ChartDemo.svelte";
    import DataTableDemo from "$lib/components/demos/DataTableDemo.svelte";
    import NavbarDemo from "$lib/components/demos/NavbarDemo.svelte";
    import NavigationMenuDemo from "$lib/components/demos/NavigationMenuDemo.svelte";
    import PaginationDemo from "$lib/components/demos/PaginationDemo.svelte";
    import SidebarDemo from "$lib/components/demos/SidebarDemo.svelte";
    import CheckboxDemo from "$lib/components/demos/CheckboxDemo.svelte";
    import DialogDemo from "$lib/components/demos/DialogDemo.svelte";
    import LabelDemo from "$lib/components/demos/LabelDemo.svelte";
    import RadioGroupDemo from "$lib/components/demos/RadioGroupDemo.svelte";
    import SelectDemo from "$lib/components/demos/SelectDemo.svelte";
    import SwitchDemo from "$lib/components/demos/SwitchDemo.svelte";
    import TabsDemo from "$lib/components/demos/TabsDemo.svelte";
    import TextareaDemo from "$lib/components/demos/TextareaDemo.svelte";
    import ToggleDemo from "$lib/components/demos/ToggleDemo.svelte";
    import ToggleGroupDemo from "$lib/components/demos/ToggleGroupDemo.svelte";
    import SliderDemo from "$lib/components/demos/SliderDemo.svelte";
    import FieldDemo from "$lib/components/demos/FieldDemo.svelte";
    import SkeletonDemo from "$lib/components/demos/SkeletonDemo.svelte";
    import SonnerDemo from "$lib/components/demos/SonnerDemo.svelte";
    import SpinnerDemo from "$lib/components/demos/SpinnerDemo.svelte";
    import ProgressDemo from "$lib/components/demos/ProgressDemo.svelte";
    import PopoverDemo from "$lib/components/demos/PopoverDemo.svelte";
    import TooltipDemo from "$lib/components/demos/TooltipDemo.svelte";
    import HoverCardDemo from "$lib/components/demos/HoverCardDemo.svelte";
    import IconGrid from "$lib/components/IconGrid.svelte";

    const demos: Record<string, any> = {
        AccordionDemo,
        AlertDemo,
        AlertDialogDemo,
        ButtonDemo,
        BadgeDemo,
        BreadcrumbDemo,
        CardDemo,
        CheckboxDemo,
        CommandDemo,
        InputDemo,
        AvatarDemo,
        SeparatorDemo,
        DropdownMenuDemo,
        ChartDemo,
        DialogDemo,
        DataTableDemo,
        FieldDemo,
        NavbarDemo,
        NavigationMenuDemo,
        PaginationDemo,
        SidebarDemo,
        LabelDemo,
        RadioGroupDemo,
        SelectDemo,
        SwitchDemo,
        TabsDemo,
        TextareaDemo,
        ToggleDemo,
        ToggleGroupDemo,
        SliderDemo,
        SkeletonDemo,
        SonnerDemo,
        SpinnerDemo,
        ProgressDemo,
        PopoverDemo,
        TooltipDemo,
        HoverCardDemo,
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
