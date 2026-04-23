<script lang="ts">
    import { Combobox } from "$registry/combobox";

    const frameworks = [
        { value: "next", label: "Next.js", keywords: ["react"] },
        { value: "sveltekit", label: "SvelteKit", keywords: ["svelte"] },
        { value: "nuxt", label: "Nuxt", keywords: ["vue"] },
        { value: "remix", label: "Remix", keywords: ["react"] },
        { value: "astro", label: "Astro" },
        { value: "bosia", label: "Bosia", keywords: ["svelte", "bun"] },
    ];

    let value = $state<string | undefined>(undefined);
</script>

<div class="flex items-center justify-center">
    <Combobox
        items={frameworks}
        bind:value
        placeholder="Select framework..."
        searchPlaceholder="Search framework..."
        emptyText="No framework found."
        class="w-[220px]"
        contentClass="w-[220px] p-0"
    />
</div>
