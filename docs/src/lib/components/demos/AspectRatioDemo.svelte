<script lang="ts">
	import { AspectRatio } from "$registry/aspect-ratio";
</script>

<div class="flex flex-col gap-6 w-full max-w-lg">
	<div>
		<p class="mb-2 text-sm font-medium text-muted-foreground">16:9</p>
		<AspectRatio ratio={16 / 9} class="overflow-hidden rounded-lg bg-muted">
			<img
				src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
				alt="Landscape placeholder"
				class="h-full w-full object-cover"
			/>
		</AspectRatio>
	</div>
	<div>
		<p class="mb-2 text-sm font-medium text-muted-foreground">1:1</p>
		<AspectRatio ratio={1} class="overflow-hidden rounded-lg bg-muted">
			<div class="flex h-full w-full items-center justify-center text-muted-foreground">
				Square content
			</div>
		</AspectRatio>
	</div>
</div>
