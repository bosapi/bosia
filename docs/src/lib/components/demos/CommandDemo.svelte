<script lang="ts">
    import {
        Command,
        CommandInput,
        CommandList,
        CommandEmpty,
        CommandGroup,
        CommandItem,
        CommandSeparator,
        CommandShortcut,
    } from "$registry/command";
</script>

<div class="flex justify-center">
    <Command class="max-w-md w-full rounded-lg border shadow-md">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
            <CommandEmpty />
            <CommandGroup heading="Suggestions">
                <CommandItem value="calendar" keywords={["schedule", "date"]}>
                    Calendar
                </CommandItem>
                <CommandItem value="search-emoji" keywords={["emoji", "face"]}>
                    Search Emoji
                </CommandItem>
                <CommandItem value="calculator" disabled>
                    Calculator
                </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
                <CommandItem value="profile">
                    Profile
                    <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem value="billing">
                    Billing
                    <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem value="settings">
                    Settings
                    <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
            </CommandGroup>
        </CommandList>
    </Command>
</div>
