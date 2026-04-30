<script lang="ts">
	import {
		Dialog,
		DialogTrigger,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose,
	} from "$registry/dialog";
	import { Button } from "$registry/button";
	import { Input } from "$registry/input";
	import { Label } from "$registry/label";
</script>

<div class="flex items-center justify-center">
	<Dialog>
		<DialogTrigger>
			<Button variant="outline">Edit Profile</Button>
		</DialogTrigger>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Edit Profile</DialogTitle>
				<DialogDescription>
					Make changes to your profile here. Click save when you're done.
				</DialogDescription>
			</DialogHeader>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label class="text-right">Name</Label>
					<Input class="col-span-3" placeholder="Enter your name" />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label class="text-right">Username</Label>
					<Input class="col-span-3" placeholder="@username" />
				</div>
			</div>
			<DialogFooter>
				<DialogClose>
					<Button variant="outline">Cancel</Button>
				</DialogClose>
				<DialogClose>
					<Button>Save changes</Button>
				</DialogClose>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</div>
