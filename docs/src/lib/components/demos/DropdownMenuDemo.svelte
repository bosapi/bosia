<script lang="ts">
    import {
        DropdownMenu, DropdownMenuTrigger,
        DropdownMenuContent, DropdownMenuItem,
        DropdownMenuSeparator
    } from "$registry/dropdown-menu";
    import { Button } from "$registry/button";

    let lastAction = $state("");
</script>

<div class="flex flex-col items-center gap-4">
    <DropdownMenu>
        <DropdownMenuTrigger>
            <Button variant="outline">Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onclick={() => lastAction = "Edit"}>
                Edit
            </DropdownMenuItem>
            <DropdownMenuItem onclick={() => lastAction = "Copy"}>
                Copy
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onclick={() => lastAction = "Delete"}>
                Delete
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
    {#if lastAction}
        <p class="text-sm text-muted-foreground">Last action: <strong>{lastAction}</strong></p>
    {/if}
</div>
