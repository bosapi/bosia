---
title: Carousel
description: A carousel component with slide navigation, keyboard support, and snap scrolling.
demo: CarouselDemo
---

```bash
bosia add carousel
```

A carousel built with CSS scroll-snap. Supports horizontal and vertical orientation, keyboard navigation, and prev/next buttons. Zero external dependencies.

## Preview

## Sub-components

| Component          | Description                                   |
| ------------------ | --------------------------------------------- |
| `Carousel`         | Root — provides context, handles keyboard nav |
| `CarouselContent`  | Scrollable viewport + flex container          |
| `CarouselItem`     | Slide wrapper with snap alignment             |
| `CarouselPrevious` | Previous slide button                         |
| `CarouselNext`     | Next slide button                             |

## Props

### Carousel

| Prop          | Type                         | Default        |
| ------------- | ---------------------------- | -------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `autoplay`    | `boolean \| number`          | `false`        |
| `class`       | `string`                     | `""`           |

### CarouselItem

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

All sub-components accept `class` and spread `...restProps`.

## Usage

```svelte
<script lang="ts">
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselPrevious,
		CarouselNext,
	} from "$lib/components/ui/carousel";
</script>

<Carousel>
	<CarouselContent>
		<CarouselItem>Slide 1</CarouselItem>
		<CarouselItem>Slide 2</CarouselItem>
		<CarouselItem>Slide 3</CarouselItem>
	</CarouselContent>
	<CarouselPrevious />
	<CarouselNext />
</Carousel>
```

## Vertical

```svelte
<Carousel orientation="vertical" class="max-h-[300px]">
	<CarouselContent class="h-[300px]">
		<CarouselItem>Slide 1</CarouselItem>
		<CarouselItem>Slide 2</CarouselItem>
	</CarouselContent>
	<CarouselPrevious />
	<CarouselNext />
</Carousel>
```

## Partial Slides

Show multiple items per view by adjusting `basis`:

```svelte
<CarouselItem class="basis-1/3">...</CarouselItem>
```

## Autoplay

Pass `autoplay` to auto-advance slides. `true` uses a 4000ms interval, or pass a number for custom ms. Pauses on hover and focus.

```svelte
<Carousel autoplay>...</Carousel>
<Carousel autoplay={2000}>...</Carousel>
```

## Keyboard

| Key                        | Action                       |
| -------------------------- | ---------------------------- |
| `ArrowLeft` / `ArrowRight` | Previous / Next (horizontal) |
| `ArrowUp` / `ArrowDown`    | Previous / Next (vertical)   |
