<script lang="ts">
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselPrevious,
		CarouselNext,
	} from "$registry/carousel";
	import { Card, CardContent } from "$registry/card";
</script>

<div class="mx-auto w-full max-w-xs">
	<Carousel autoplay={5000}>
		<CarouselContent>
			{#each Array.from({ length: 5 }, (_, i) => i + 1) as num}
				<CarouselItem>
					<Card>
						<CardContent class="flex aspect-square items-center justify-center p-6">
							<span class="text-4xl font-semibold">{num}</span>
						</CardContent>
					</Card>
				</CarouselItem>
			{/each}
		</CarouselContent>
		<CarouselPrevious />
		<CarouselNext />
	</Carousel>
</div>
