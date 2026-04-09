<script lang="ts">
    import { toast } from "$registry/sonner";
    import { Button } from "$registry/button";
</script>

<div class="flex flex-wrap items-center gap-2">
    <Button variant="outline" onclick={() => toast("Event has been created.")}>
        Default
    </Button>
    <Button
        variant="outline"
        onclick={() => toast.success("Event has been created successfully.")}
    >
        Success
    </Button>
    <Button
        variant="outline"
        onclick={() => toast.error("Event could not be created.")}
    >
        Error
    </Button>
    <Button
        variant="outline"
        onclick={() => toast.info("This is an informational message.")}
    >
        Info
    </Button>
    <Button
        variant="outline"
        onclick={() => toast.warning("Please review before continuing.")}
    >
        Warning
    </Button>
    <Button
        variant="outline"
        onclick={() =>
            toast("Event created", {
                description: "Monday, January 3rd at 6:00pm",
            })}
    >
        With Description
    </Button>
</div>
