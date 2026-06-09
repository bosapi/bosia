<script lang="ts">
	import {
		Drawer,
		DrawerTrigger,
		DrawerContent,
		DrawerHeader,
		DrawerTitle,
		DrawerDescription,
		DrawerFooter,
		DrawerClose,
	} from "$registry/drawer";
	import { Button } from "$registry/button";
</script>

<div class="flex items-center justify-center">
	<Drawer>
		<DrawerTrigger>
			<Button variant="outline">Open Drawer</Button>
		</DrawerTrigger>
		<DrawerContent>
			<div class="mx-auto w-full max-w-sm">
				<DrawerHeader>
					<DrawerTitle>Move Goal</DrawerTitle>
					<DrawerDescription>Set a daily activity target.</DrawerDescription>
				</DrawerHeader>
				<div class="grid gap-4 py-4">
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Calories per day</span>
						<span class="text-2xl font-semibold">350</span>
					</div>
					<p class="text-sm text-muted-foreground">
						Tap outside, swipe down, or press Escape to dismiss.
					</p>
				</div>
				<DrawerFooter>
					<Button>Save</Button>
					<DrawerClose>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</div>
		</DrawerContent>
	</Drawer>
</div>
