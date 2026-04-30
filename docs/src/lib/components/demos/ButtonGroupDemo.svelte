<script lang="ts">
	import { ButtonGroup } from "$registry/button-group";
	import { Button } from "$registry/button";
</script>

<div class="flex flex-col gap-6">
	<!-- Default (horizontal, outline) -->
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">Horizontal (outline)</p>
		<ButtonGroup aria-label="Actions">
			<Button variant="outline">Save</Button>
			<Button variant="outline">Edit</Button>
			<Button variant="outline">Delete</Button>
		</ButtonGroup>
	</div>

	<!-- Default variant -->
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">Default variant</p>
		<ButtonGroup aria-label="Actions">
			<Button>Previous</Button>
			<Button>Next</Button>
		</ButtonGroup>
	</div>

	<!-- Vertical -->
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">Vertical</p>
		<ButtonGroup orientation="vertical" aria-label="Navigation">
			<Button variant="outline">Profile</Button>
			<Button variant="outline">Settings</Button>
			<Button variant="outline">Logout</Button>
		</ButtonGroup>
	</div>

	<!-- With icons -->
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">With icons</p>
		<ButtonGroup aria-label="Text alignment">
			<Button variant="outline" size="icon" aria-label="Align left">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><line x1="21" x2="3" y1="6" y2="6" /><line
						x1="15"
						x2="3"
						y1="12"
						y2="12"
					/><line x1="17" x2="3" y1="18" y2="18" /></svg
				>
			</Button>
			<Button variant="outline" size="icon" aria-label="Align center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><line x1="21" x2="3" y1="6" y2="6" /><line
						x1="18"
						x2="6"
						y1="12"
						y2="12"
					/><line x1="21" x2="3" y1="18" y2="18" /></svg
				>
			</Button>
			<Button variant="outline" size="icon" aria-label="Align right">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><line x1="21" x2="3" y1="6" y2="6" /><line
						x1="21"
						x2="9"
						y1="12"
						y2="12"
					/><line x1="21" x2="7" y1="18" y2="18" /></svg
				>
			</Button>
		</ButtonGroup>
	</div>

	<!-- Sizes -->
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">Sizes</p>
		<div class="flex items-center gap-4">
			<ButtonGroup aria-label="Small group">
				<Button variant="outline" size="sm">S</Button>
				<Button variant="outline" size="sm">M</Button>
				<Button variant="outline" size="sm">L</Button>
			</ButtonGroup>
			<ButtonGroup aria-label="Default group">
				<Button variant="outline">S</Button>
				<Button variant="outline">M</Button>
				<Button variant="outline">L</Button>
			</ButtonGroup>
			<ButtonGroup aria-label="Large group">
				<Button variant="outline" size="lg">S</Button>
				<Button variant="outline" size="lg">M</Button>
				<Button variant="outline" size="lg">L</Button>
			</ButtonGroup>
		</div>
	</div>
</div>
