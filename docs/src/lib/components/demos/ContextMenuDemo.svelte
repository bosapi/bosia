<script lang="ts">
	import {
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuContent,
		ContextMenuItem,
		ContextMenuSeparator,
		ContextMenuLabel,
		ContextMenuShortcut,
		ContextMenuSub,
		ContextMenuSubTrigger,
		ContextMenuSubContent,
	} from "$registry/context-menu";

	let lastAction = $state("");
</script>

<div class="flex flex-col items-center gap-4">
	<ContextMenu>
		<ContextMenuTrigger>
			<div
				class="flex h-36 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground"
			>
				Right click here
			</div>
		</ContextMenuTrigger>
		<ContextMenuContent>
			<ContextMenuLabel>Actions</ContextMenuLabel>
			<ContextMenuSeparator />
			<ContextMenuItem onclick={() => (lastAction = "Back")}>
				Back
				<ContextMenuShortcut>⌘[</ContextMenuShortcut>
			</ContextMenuItem>
			<ContextMenuItem onclick={() => (lastAction = "Forward")} disabled>
				Forward
				<ContextMenuShortcut>⌘]</ContextMenuShortcut>
			</ContextMenuItem>
			<ContextMenuItem onclick={() => (lastAction = "Reload")}>
				Reload
				<ContextMenuShortcut>⌘R</ContextMenuShortcut>
			</ContextMenuItem>
			<ContextMenuSeparator />
			<ContextMenuSub>
				<ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
				<ContextMenuSubContent>
					<ContextMenuItem onclick={() => (lastAction = "Save Page As...")}>
						Save Page As...
						<ContextMenuShortcut>⌘S</ContextMenuShortcut>
					</ContextMenuItem>
					<ContextMenuItem onclick={() => (lastAction = "Create Shortcut...")}>
						Create Shortcut...
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem onclick={() => (lastAction = "Developer Tools")}>
						Developer Tools
					</ContextMenuItem>
				</ContextMenuSubContent>
			</ContextMenuSub>
		</ContextMenuContent>
	</ContextMenu>
	{#if lastAction}
		<p class="text-sm text-muted-foreground">Last action: <strong>{lastAction}</strong></p>
	{/if}
</div>
