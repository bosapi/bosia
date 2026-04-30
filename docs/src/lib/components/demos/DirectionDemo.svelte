<script lang="ts">
	import { DirectionProvider } from "$registry/direction";

	let dir = $state<"ltr" | "rtl">("ltr");
</script>

<div class="flex flex-col gap-4 w-full max-w-md">
	<button
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-fit"
		onclick={() => (dir = dir === "ltr" ? "rtl" : "ltr")}
	>
		Toggle to {dir === "ltr" ? "RTL" : "LTR"}
	</button>

	<DirectionProvider direction={dir} class="rounded-md border p-4 space-y-2">
		<p class="text-sm font-medium">Direction: {dir.toUpperCase()}</p>
		<p class="text-sm text-muted-foreground">This text follows the document direction.</p>
		<p class="text-sm text-muted-foreground" dir="auto">مرحبًا بالعالم — Hello World</p>
	</DirectionProvider>
</div>
