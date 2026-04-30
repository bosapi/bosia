<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from "$registry/toggle-group";

	let singleValue = $state("bold");
	let multipleValue = $state(["bold", "italic"]);
</script>

<div class="flex flex-col gap-6">
	<!-- Single selection -->
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">Single selection</p>
		<div class="flex items-center gap-3">
			<ToggleGroup type="single" bind:value={singleValue} aria-label="Text formatting">
				<ToggleGroupItem value="bold" aria-label="Bold">
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
						><path
							d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"
						/></svg
					>
				</ToggleGroupItem>
				<ToggleGroupItem value="italic" aria-label="Italic">
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
						><line x1="19" x2="10" y1="4" y2="4" /><line
							x1="14"
							x2="5"
							y1="20"
							y2="20"
						/><line x1="15" x2="9" y1="4" y2="20" /></svg
					>
				</ToggleGroupItem>
				<ToggleGroupItem value="underline" aria-label="Underline">
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
						><path d="M6 4v6a6 6 0 0 0 12 0V4" /><line
							x1="4"
							x2="20"
							y1="20"
							y2="20"
						/></svg
					>
				</ToggleGroupItem>
			</ToggleGroup>
			<span class="text-sm text-muted-foreground">Selected: {singleValue || "none"}</span>
		</div>
	</div>

	<!-- Multiple selection -->
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">Multiple selection</p>
		<div class="flex items-center gap-3">
			<ToggleGroup type="multiple" bind:value={multipleValue} aria-label="Text formatting">
				<ToggleGroupItem value="bold" aria-label="Bold">
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
						><path
							d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"
						/></svg
					>
				</ToggleGroupItem>
				<ToggleGroupItem value="italic" aria-label="Italic">
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
						><line x1="19" x2="10" y1="4" y2="4" /><line
							x1="14"
							x2="5"
							y1="20"
							y2="20"
						/><line x1="15" x2="9" y1="4" y2="20" /></svg
					>
				</ToggleGroupItem>
				<ToggleGroupItem value="underline" aria-label="Underline">
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
						><path d="M6 4v6a6 6 0 0 0 12 0V4" /><line
							x1="4"
							x2="20"
							y1="20"
							y2="20"
						/></svg
					>
				</ToggleGroupItem>
			</ToggleGroup>
			<span class="text-sm text-muted-foreground"
				>Selected: {multipleValue.length ? multipleValue.join(", ") : "none"}</span
			>
		</div>
	</div>

	<!-- Outline variant -->
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">Outline variant</p>
		<ToggleGroup type="single" variant="outline" aria-label="Text alignment">
			<ToggleGroupItem value="left" aria-label="Align left">
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
			</ToggleGroupItem>
			<ToggleGroupItem value="center" aria-label="Align center">
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
			</ToggleGroupItem>
			<ToggleGroupItem value="right" aria-label="Align right">
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
			</ToggleGroupItem>
		</ToggleGroup>
	</div>

	<!-- Sizes -->
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">Sizes</p>
		<div class="flex items-center gap-4">
			<ToggleGroup type="single" size="sm" aria-label="Small group">
				<ToggleGroupItem value="a" aria-label="Option A">A</ToggleGroupItem>
				<ToggleGroupItem value="b" aria-label="Option B">B</ToggleGroupItem>
			</ToggleGroup>
			<ToggleGroup type="single" aria-label="Default group">
				<ToggleGroupItem value="a" aria-label="Option A">A</ToggleGroupItem>
				<ToggleGroupItem value="b" aria-label="Option B">B</ToggleGroupItem>
			</ToggleGroup>
			<ToggleGroup type="single" size="lg" aria-label="Large group">
				<ToggleGroupItem value="a" aria-label="Option A">A</ToggleGroupItem>
				<ToggleGroupItem value="b" aria-label="Option B">B</ToggleGroupItem>
			</ToggleGroup>
		</div>
	</div>

	<!-- Disabled -->
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">Disabled</p>
		<ToggleGroup type="single" disabled aria-label="Disabled group">
			<ToggleGroupItem value="bold" aria-label="Bold">
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
					><path
						d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"
					/></svg
				>
			</ToggleGroupItem>
			<ToggleGroupItem value="italic" aria-label="Italic">
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
					><line x1="19" x2="10" y1="4" y2="4" /><line
						x1="14"
						x2="5"
						y1="20"
						y2="20"
					/><line x1="15" x2="9" y1="4" y2="20" /></svg
				>
			</ToggleGroupItem>
		</ToggleGroup>
	</div>
</div>
