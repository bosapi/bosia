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
	import ModeSwitcherDemo from "$lib/components/demos/ModeSwitcherDemo.svelte";
	import NavbarDemo from "$lib/components/demos/NavbarDemo.svelte";
	import NativeSelectDemo from "$lib/components/demos/NativeSelectDemo.svelte";
	import NavigationMenuDemo from "$lib/components/demos/NavigationMenuDemo.svelte";
	import PaginationDemo from "$lib/components/demos/PaginationDemo.svelte";
	import SidebarDemo from "$lib/components/demos/SidebarDemo.svelte";
	import CheckboxDemo from "$lib/components/demos/CheckboxDemo.svelte";
	import DialogDemo from "$lib/components/demos/DialogDemo.svelte";
	import DrawerDemo from "$lib/components/demos/DrawerDemo.svelte";
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
	import FilesUploadCropDemo from "$lib/components/demos/FilesUploadCropDemo.svelte";
	import FilesImageDialogDemo from "$lib/components/demos/FilesImageDialogDemo.svelte";
	import CardsDataDemo from "$lib/components/demos/CardsDataDemo.svelte";
	import CardsPeopleDemo from "$lib/components/demos/CardsPeopleDemo.svelte";
	import CardsCommerceDemo from "$lib/components/demos/CardsCommerceDemo.svelte";
	import CardsMediaDemo from "$lib/components/demos/CardsMediaDemo.svelte";
	import CardsUtilityDemo from "$lib/components/demos/CardsUtilityDemo.svelte";
	import CardsAuthDemo from "$lib/components/demos/CardsAuthDemo.svelte";
	import HeroShopSplitDemo from "$lib/components/demos/HeroShopSplitDemo.svelte";
	import HeroSaleDemo from "$lib/components/demos/HeroSaleDemo.svelte";
	import HeroBagsDemo from "$lib/components/demos/HeroBagsDemo.svelte";
	import HeroBookstoreDemo from "$lib/components/demos/HeroBookstoreDemo.svelte";
	import HeroToysDemo from "$lib/components/demos/HeroToysDemo.svelte";
	import HeroHomeGoodsDemo from "$lib/components/demos/HeroHomeGoodsDemo.svelte";
	import HeroApparelDemo from "$lib/components/demos/HeroApparelDemo.svelte";
	import HeroCourseDemo from "$lib/components/demos/HeroCourseDemo.svelte";
	import HeroCampusDemo from "$lib/components/demos/HeroCampusDemo.svelte";
	import HeroRestaurantDemo from "$lib/components/demos/HeroRestaurantDemo.svelte";
	import HeroDeliveryDemo from "$lib/components/demos/HeroDeliveryDemo.svelte";
	import HeroLookbookDemo from "$lib/components/demos/HeroLookbookDemo.svelte";
	import HeroNewDropDemo from "$lib/components/demos/HeroNewDropDemo.svelte";
	import HeroAgencyDemo from "$lib/components/demos/HeroAgencyDemo.svelte";
	import HeroConsultingDemo from "$lib/components/demos/HeroConsultingDemo.svelte";
	import HeroAppDemo from "$lib/components/demos/HeroAppDemo.svelte";
	import HeroProductDemo from "$lib/components/demos/HeroProductDemo.svelte";
	import NavbarsStandardDemo from "$lib/components/demos/NavbarsStandardDemo.svelte";
	import NavbarsThemesDemo from "$lib/components/demos/NavbarsThemesDemo.svelte";
	import NavbarsAppDemo from "$lib/components/demos/NavbarsAppDemo.svelte";
	import DocksDemo from "$lib/components/demos/DocksDemo.svelte";
	import FootersStandardDemo from "$lib/components/demos/FootersStandardDemo.svelte";
	import FootersThemesDemo from "$lib/components/demos/FootersThemesDemo.svelte";
	import PricingSectionsDemo from "$lib/components/demos/PricingSectionsDemo.svelte";
	import TestimonialsSectionsDemo from "$lib/components/demos/TestimonialsSectionsDemo.svelte";
	import FaqSectionsDemo from "$lib/components/demos/FaqSectionsDemo.svelte";
	import CtaSectionsDemo from "$lib/components/demos/CtaSectionsDemo.svelte";
	import FeaturesSectionsDemo from "$lib/components/demos/FeaturesSectionsDemo.svelte";
	import StatsSectionsDemo from "$lib/components/demos/StatsSectionsDemo.svelte";
	import LogosSectionsDemo from "$lib/components/demos/LogosSectionsDemo.svelte";
	import StorefrontLayoutDemo from "$lib/components/demos/StorefrontLayoutDemo.svelte";
	import StorefrontHomeDemo from "$lib/components/demos/StorefrontHomeDemo.svelte";
	import StorefrontCatalogDemo from "$lib/components/demos/StorefrontCatalogDemo.svelte";
	import StorefrontListingDemo from "$lib/components/demos/StorefrontListingDemo.svelte";
	import StorefrontProductDemo from "$lib/components/demos/StorefrontProductDemo.svelte";
	import StorefrontCheckoutDemo from "$lib/components/demos/StorefrontCheckoutDemo.svelte";
	import StorefrontCartWishlistDemo from "$lib/components/demos/StorefrontCartWishlistDemo.svelte";
	import StorefrontAccountDemo from "$lib/components/demos/StorefrontAccountDemo.svelte";
	import PagesHomeDemo from "$lib/components/demos/PagesHomeDemo.svelte";
	import PagesListingDemo from "$lib/components/demos/PagesListingDemo.svelte";
	import PagesProductDemo from "$lib/components/demos/PagesProductDemo.svelte";
	import PagesCheckoutDemo from "$lib/components/demos/PagesCheckoutDemo.svelte";
	import PagesCartDemo from "$lib/components/demos/PagesCartDemo.svelte";
	import PagesWishlistDemo from "$lib/components/demos/PagesWishlistDemo.svelte";
	import PagesSearchDemo from "$lib/components/demos/PagesSearchDemo.svelte";
	import PagesAccountDemo from "$lib/components/demos/PagesAccountDemo.svelte";
	import AuthBlocksDemo from "$lib/components/demos/AuthBlocksDemo.svelte";
	import AuthLoginDemo from "$lib/components/demos/AuthLoginDemo.svelte";
	import AuthRegisterDemo from "$lib/components/demos/AuthRegisterDemo.svelte";
	import AuthForgotDemo from "$lib/components/demos/AuthForgotDemo.svelte";
	import AuthMagicLinkDemo from "$lib/components/demos/AuthMagicLinkDemo.svelte";
	import AuthOtpDemo from "$lib/components/demos/AuthOtpDemo.svelte";
	import AuthSsoDemo from "$lib/components/demos/AuthSsoDemo.svelte";
	import PagesLandingSaasDemo from "$lib/components/demos/PagesLandingSaasDemo.svelte";
	import PagesLandingSimpleDemo from "$lib/components/demos/PagesLandingSimpleDemo.svelte";
	import ContactSectionsDemo from "$lib/components/demos/ContactSectionsDemo.svelte";
	import TeamSectionsDemo from "$lib/components/demos/TeamSectionsDemo.svelte";
	import PagesCompanyContactDemo from "$lib/components/demos/PagesCompanyContactDemo.svelte";
	import PagesCompanyAboutDemo from "$lib/components/demos/PagesCompanyAboutDemo.svelte";
	import BlogSectionsDemo from "$lib/components/demos/BlogSectionsDemo.svelte";
	import PagesBlogIndexDemo from "$lib/components/demos/PagesBlogIndexDemo.svelte";
	import PagesBlogPostDemo from "$lib/components/demos/PagesBlogPostDemo.svelte";
	import GallerySectionsDemo from "$lib/components/demos/GallerySectionsDemo.svelte";
	import ProcessSectionsDemo from "$lib/components/demos/ProcessSectionsDemo.svelte";
	import PagesErrorsDemo from "$lib/components/demos/PagesErrorsDemo.svelte";
	import NewsletterSectionsDemo from "$lib/components/demos/NewsletterSectionsDemo.svelte";
	import ConsentBannerDemo from "$lib/components/demos/ConsentBannerDemo.svelte";

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
		DrawerDemo,
		DatePickerDemo,
		DataTableDemo,
		DirectionDemo,
		EmptyDemo,
		FieldDemo,
		FormDemo,
		NativeSelectDemo,
		NavbarDemo,
		ModeSwitcherDemo,
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
		FilesUploadCropDemo,
		FilesImageDialogDemo,
		CardsDataDemo,
		CardsPeopleDemo,
		CardsCommerceDemo,
		CardsMediaDemo,
		CardsUtilityDemo,
		CardsAuthDemo,
		HeroShopSplitDemo,
		HeroSaleDemo,
		HeroBagsDemo,
		HeroBookstoreDemo,
		HeroToysDemo,
		HeroHomeGoodsDemo,
		HeroApparelDemo,
		HeroCourseDemo,
		HeroCampusDemo,
		HeroRestaurantDemo,
		HeroDeliveryDemo,
		HeroLookbookDemo,
		HeroNewDropDemo,
		HeroAgencyDemo,
		HeroConsultingDemo,
		HeroAppDemo,
		HeroProductDemo,
		NavbarsStandardDemo,
		NavbarsThemesDemo,
		NavbarsAppDemo,
		DocksDemo,
		FootersStandardDemo,
		FootersThemesDemo,
		PricingSectionsDemo,
		TestimonialsSectionsDemo,
		FaqSectionsDemo,
		CtaSectionsDemo,
		FeaturesSectionsDemo,
		StatsSectionsDemo,
		LogosSectionsDemo,
		StorefrontLayoutDemo,
		StorefrontHomeDemo,
		StorefrontCatalogDemo,
		StorefrontListingDemo,
		StorefrontProductDemo,
		StorefrontCheckoutDemo,
		StorefrontCartWishlistDemo,
		StorefrontAccountDemo,
		PagesHomeDemo,
		PagesListingDemo,
		PagesProductDemo,
		PagesCheckoutDemo,
		PagesCartDemo,
		PagesWishlistDemo,
		PagesSearchDemo,
		PagesAccountDemo,
		AuthBlocksDemo,
		AuthLoginDemo,
		AuthRegisterDemo,
		AuthForgotDemo,
		AuthMagicLinkDemo,
		AuthOtpDemo,
		AuthSsoDemo,
		PagesLandingSaasDemo,
		PagesLandingSimpleDemo,
		ContactSectionsDemo,
		TeamSectionsDemo,
		PagesCompanyContactDemo,
		PagesCompanyAboutDemo,
		BlogSectionsDemo,
		PagesBlogIndexDemo,
		PagesBlogPostDemo,
		GallerySectionsDemo,
		ProcessSectionsDemo,
		PagesErrorsDemo,
		NewsletterSectionsDemo,
		ConsentBannerDemo,
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
