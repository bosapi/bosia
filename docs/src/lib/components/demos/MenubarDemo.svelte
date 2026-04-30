<script lang="ts">
	import {
		Menubar,
		MenubarMenu,
		MenubarTrigger,
		MenubarContent,
		MenubarItem,
		MenubarSeparator,
		MenubarLabel,
		MenubarShortcut,
		MenubarSub,
		MenubarSubTrigger,
		MenubarSubContent,
	} from "$lib/components/ui/menubar";
</script>

<Menubar>
	<MenubarMenu>
		<MenubarTrigger>File</MenubarTrigger>
		<MenubarContent>
			<MenubarItem>
				New File
				<MenubarShortcut>⌘N</MenubarShortcut>
			</MenubarItem>
			<MenubarItem>New Window</MenubarItem>
			<MenubarSeparator />
			<MenubarSub>
				<MenubarSubTrigger>Share</MenubarSubTrigger>
				<MenubarSubContent>
					<MenubarItem>Email</MenubarItem>
					<MenubarItem>Messages</MenubarItem>
					<MenubarItem>Copy Link</MenubarItem>
				</MenubarSubContent>
			</MenubarSub>
			<MenubarSeparator />
			<MenubarItem>
				Save
				<MenubarShortcut>⌘S</MenubarShortcut>
			</MenubarItem>
		</MenubarContent>
	</MenubarMenu>

	<MenubarMenu>
		<MenubarTrigger>Edit</MenubarTrigger>
		<MenubarContent>
			<MenubarItem>
				Undo
				<MenubarShortcut>⌘Z</MenubarShortcut>
			</MenubarItem>
			<MenubarItem>
				Redo
				<MenubarShortcut>⇧⌘Z</MenubarShortcut>
			</MenubarItem>
			<MenubarSeparator />
			<MenubarItem>
				Cut
				<MenubarShortcut>⌘X</MenubarShortcut>
			</MenubarItem>
			<MenubarItem>
				Copy
				<MenubarShortcut>⌘C</MenubarShortcut>
			</MenubarItem>
			<MenubarItem>
				Paste
				<MenubarShortcut>⌘V</MenubarShortcut>
			</MenubarItem>
		</MenubarContent>
	</MenubarMenu>

	<MenubarMenu>
		<MenubarTrigger>View</MenubarTrigger>
		<MenubarContent>
			<MenubarLabel>Appearance</MenubarLabel>
			<MenubarItem>Toggle Sidebar</MenubarItem>
			<MenubarItem>Toggle Fullscreen</MenubarItem>
		</MenubarContent>
	</MenubarMenu>
</Menubar>
