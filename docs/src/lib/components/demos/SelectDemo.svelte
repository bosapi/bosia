<script lang="ts">
    import {
        Select,
        SelectTrigger,
        SelectValue,
        SelectContent,
        SelectItem,
        SelectGroup,
        SelectLabel,
        SelectSeparator,
    } from "$registry/select";

    let fruit = $state("apple");
</script>

<div class="flex flex-col gap-6">
    <Select bind:value={fruit}>
        <SelectTrigger class="w-[200px]">
            <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple" label="Apple" />
                <SelectItem value="banana" label="Banana" />
                <SelectItem value="mango" label="Mango" />
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
                <SelectLabel>Vegetables</SelectLabel>
                <SelectItem value="carrot" label="Carrot" />
                <SelectItem value="potato" label="Potato" disabled />
            </SelectGroup>
        </SelectContent>
    </Select>
    <p class="text-sm text-muted-foreground">
        Selected: <span class="font-medium text-foreground">{fruit}</span>
    </p>
</div>
