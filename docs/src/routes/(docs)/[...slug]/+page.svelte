<script lang="ts">
	import TableOfContents from "$lib/components/TableOfContents.svelte";
	import ComponentPreview from "$lib/components/ComponentPreview.svelte";

	// Demo component map
	import AspectRatioDemo from "$lib/components/demos/AspectRatioDemo.svelte";
	import AccordionDemo from "$lib/components/demos/AccordionDemo.svelte";
	import AlertDemo from "$lib/components/demos/AlertDemo.svelte";
	import AlertDialogDemo from "$lib/components/demos/AlertDialogDemo.svelte";
	import ButtonDemo from "$lib/components/demos/ButtonDemo.svelte";
	import ButtonGroupDemo from "$lib/components/demos/ButtonGroupDemo.svelte";
	import CalendarDemo from "$lib/components/demos/CalendarDemo.svelte";
	import CollapsibleDemo from "$lib/components/demos/CollapsibleDemo.svelte";
	import BadgeDemo from "$lib/components/demos/BadgeDemo.svelte";
	import BreadcrumbDemo from "$lib/components/demos/BreadcrumbDemo.svelte";
	import CardDemo from "$lib/components/demos/CardDemo.svelte";
	import CarouselDemo from "$lib/components/demos/CarouselDemo.svelte";
	import CommandDemo from "$lib/components/demos/CommandDemo.svelte";
	import ComboboxDemo from "$lib/components/demos/ComboboxDemo.svelte";
	import ContextMenuDemo from "$lib/components/demos/ContextMenuDemo.svelte";
	import InputDemo from "$lib/components/demos/InputDemo.svelte";
	import InputGroupDemo from "$lib/components/demos/InputGroupDemo.svelte";
	import InputOtpDemo from "$lib/components/demos/InputOtpDemo.svelte";
	import KbdDemo from "$lib/components/demos/KbdDemo.svelte";
	import ItemDemo from "$lib/components/demos/ItemDemo.svelte";
	import AvatarDemo from "$lib/components/demos/AvatarDemo.svelte";
	import SeparatorDemo from "$lib/components/demos/SeparatorDemo.svelte";
	import DropdownMenuDemo from "$lib/components/demos/DropdownMenuDemo.svelte";
	import ChartDemo from "$lib/components/demos/ChartDemo.svelte";
	import DatePickerDemo from "$lib/components/demos/DatePickerDemo.svelte";
	import DataTableDemo from "$lib/components/demos/DataTableDemo.svelte";
	import DirectionDemo from "$lib/components/demos/DirectionDemo.svelte";
	import EmptyDemo from "$lib/components/demos/EmptyDemo.svelte";
	import NavbarDemo from "$lib/components/demos/NavbarDemo.svelte";
	import NativeSelectDemo from "$lib/components/demos/NativeSelectDemo.svelte";
	import NavigationMenuDemo from "$lib/components/demos/NavigationMenuDemo.svelte";
	import PaginationDemo from "$lib/components/demos/PaginationDemo.svelte";
	import SidebarDemo from "$lib/components/demos/SidebarDemo.svelte";
	import CheckboxDemo from "$lib/components/demos/CheckboxDemo.svelte";
	import DialogDemo from "$lib/components/demos/DialogDemo.svelte";
	import LabelDemo from "$lib/components/demos/LabelDemo.svelte";
	import MenubarDemo from "$lib/components/demos/MenubarDemo.svelte";
	import RadioGroupDemo from "$lib/components/demos/RadioGroupDemo.svelte";
	import RangeCalendarDemo from "$lib/components/demos/RangeCalendarDemo.svelte";
	import ResizableDemo from "$lib/components/demos/ResizableDemo.svelte";
	import ScrollAreaDemo from "$lib/components/demos/ScrollAreaDemo.svelte";
	import SelectDemo from "$lib/components/demos/SelectDemo.svelte";
	import SwitchDemo from "$lib/components/demos/SwitchDemo.svelte";
	import TableDemo from "$lib/components/demos/TableDemo.svelte";
	import TabsDemo from "$lib/components/demos/TabsDemo.svelte";
	import TextareaDemo from "$lib/components/demos/TextareaDemo.svelte";
	import ToggleDemo from "$lib/components/demos/ToggleDemo.svelte";
	import ToggleGroupDemo from "$lib/components/demos/ToggleGroupDemo.svelte";
	import SliderDemo from "$lib/components/demos/SliderDemo.svelte";
	import FieldDemo from "$lib/components/demos/FieldDemo.svelte";
	import FormDemo from "$lib/components/demos/FormDemo.svelte";
	import SkeletonDemo from "$lib/components/demos/SkeletonDemo.svelte";
	import SonnerDemo from "$lib/components/demos/SonnerDemo.svelte";
	import SpinnerDemo from "$lib/components/demos/SpinnerDemo.svelte";
	import ProgressDemo from "$lib/components/demos/ProgressDemo.svelte";
	import PopoverDemo from "$lib/components/demos/PopoverDemo.svelte";
	import TooltipDemo from "$lib/components/demos/TooltipDemo.svelte";
	import HoverCardDemo from "$lib/components/demos/HoverCardDemo.svelte";
	import TypographyDemo from "$lib/components/demos/TypographyDemo.svelte";
	import IconGrid from "$lib/components/IconGrid.svelte";

	const demos: Record<string, any> = {
		AspectRatioDemo,
		AccordionDemo,
		AlertDemo,
		AlertDialogDemo,
		ButtonDemo,
		ButtonGroupDemo,
		CalendarDemo,
		BadgeDemo,
		BreadcrumbDemo,
		CardDemo,
		CarouselDemo,
		CheckboxDemo,
		CollapsibleDemo,
		CommandDemo,
		ComboboxDemo,
		ContextMenuDemo,
		InputDemo,
		InputGroupDemo,
		InputOtpDemo,
		KbdDemo,
		ItemDemo,
		AvatarDemo,
		SeparatorDemo,
		DropdownMenuDemo,
		ChartDemo,
		DialogDemo,
		DatePickerDemo,
		DataTableDemo,
		DirectionDemo,
		EmptyDemo,
		FieldDemo,
		FormDemo,
		NativeSelectDemo,
		NavbarDemo,
		NavigationMenuDemo,
		PaginationDemo,
		SidebarDemo,
		LabelDemo,
		MenubarDemo,
		RadioGroupDemo,
		RangeCalendarDemo,
		ResizableDemo,
		ScrollAreaDemo,
		SelectDemo,
		SwitchDemo,
		TableDemo,
		TabsDemo,
		TextareaDemo,
		ToggleDemo,
		ToggleGroupDemo,
		SliderDemo,
		SkeletonDemo,
		SonnerDemo,
		SpinnerDemo,
		ProgressDemo,
		PopoverDemo,
		TooltipDemo,
		HoverCardDemo,
		TypographyDemo,
		IconGrid,
	};

	let { data }: { data: any } = $props();

	const demo = $derived(data.frontmatter?.demo ? demos[data.frontmatter.demo] : null);

	const previewMarker = '<h2 id="preview">Preview</h2>';
	const splitIndex = $derived(data.html.indexOf(previewMarker));
	const beforePreview = $derived(
		splitIndex >= 0 ? data.html.slice(0, splitIndex + previewMarker.length) : data.html,
	);
	const afterPreview = $derived(
		splitIndex >= 0 ? data.html.slice(splitIndex + previewMarker.length) : "",
	);
</script>

<div class="flex gap-8">
	<div class="min-w-0 flex-1">
		<!-- Page header -->
		<div class="mb-6">
			<h1 class="text-3xl font-bold tracking-tight">{data.frontmatter.title}</h1>
			{#if data.frontmatter.description}
				<p class="mt-2 text-lg text-muted-foreground">{data.frontmatter.description}</p>
			{/if}
		</div>

		<!-- Component demo preview (fallback: top of page when no ## Preview heading) -->
		{#if demo && splitIndex < 0}
			<ComponentPreview demoCode={data.demoCode}>
				{@const DemoComponent = demo}
				<DemoComponent />
			</ComponentPreview>
		{/if}

		<!-- Rendered markdown (before preview) -->
		<div class="prose">
			{@html beforePreview}
		</div>

		<!-- Component demo preview (inline at ## Preview heading) -->
		{#if demo && splitIndex >= 0}
			<ComponentPreview demoCode={data.demoCode}>
				{@const DemoComponent = demo}
				<DemoComponent />
			</ComponentPreview>
		{/if}

		<!-- Rendered markdown (after preview) -->
		{#if afterPreview}
			<div class="prose">
				{@html afterPreview}
			</div>
		{/if}
	</div>

	<!-- Table of Contents (desktop) -->
	<aside class="hidden w-48 shrink-0 xl:block">
		<div class="sticky top-16 py-6">
			<TableOfContents headings={data.headings} />
		</div>
	</aside>
</div>
