export interface NavItem {
	label: string;
	labelId?: string;
	slug?: string;
	children?: NavItem[];
}

export interface NavGroup {
	label: string;
	labelId?: string;
	items: NavItem[];
}

export const sidebar: NavGroup[] = [
	{
		label: "Start Here",
		labelId: "Mulai di Sini",
		items: [
			{ label: "Introduction", labelId: "Pengenalan", slug: "" },
			{ label: "Getting Started", labelId: "Memulai", slug: "getting-started" },
			{ label: "Project Structure", labelId: "Struktur Proyek", slug: "project-structure" },
		],
	},
	{
		label: "Guides",
		labelId: "Panduan",
		items: [
			{ label: "Routing", slug: "guides/routing" },
			{ label: "Navigation", labelId: "Navigasi", slug: "guides/navigation" },
			{ label: "Server Loaders", labelId: "Server Loader", slug: "guides/server-loaders" },
			{
				label: "Request Deduplication",
				labelId: "Deduplikasi Request",
				slug: "guides/request-deduplication",
			},
			{
				label: "Server Metadata",
				labelId: "Server Metadata",
				slug: "guides/server-metadata",
			},
			{ label: "API Routes", labelId: "API Route", slug: "guides/api-routes" },
			{ label: "Form Actions", labelId: "Form Action", slug: "guides/form-actions" },
			{
				label: "Middleware Hooks",
				labelId: "Middleware Hook",
				slug: "guides/middleware-hooks",
			},
			{
				label: "Environment Variables",
				labelId: "Variabel Lingkungan",
				slug: "guides/environment-variables",
			},
			{ label: "Styling", slug: "guides/styling" },
			{ label: "Security", labelId: "Keamanan", slug: "guides/security" },
			{ label: "Testing", slug: "guides/testing" },
			{ label: "Plugins", labelId: "Plugin", slug: "guides/plugins" },
			{ label: "File Upload", labelId: "Unggah Berkas", slug: "guides/file-upload" },
			{ label: "Contact Form", labelId: "Form Kontak", slug: "guides/contact-form" },
		],
	},
	{
		label: "Components",
		labelId: "Komponen",
		items: [
			{ label: "Overview", labelId: "Ringkasan", slug: "components/overview" },
			{
				label: "UI",
				children: [
					{ label: "Aspect Ratio", slug: "components/ui/aspect-ratio" },
					{ label: "Accordion", slug: "components/ui/accordion" },
					{ label: "Alert", slug: "components/ui/alert" },
					{ label: "Alert Dialog", slug: "components/ui/alert-dialog" },
					{ label: "Avatar", slug: "components/ui/avatar" },
					{ label: "Badge", slug: "components/ui/badge" },
					{ label: "Breadcrumb", slug: "components/ui/breadcrumb" },
					{ label: "Button", slug: "components/ui/button" },
					{ label: "Button Group", slug: "components/ui/button-group" },
					{ label: "Calendar", slug: "components/ui/calendar" },
					{ label: "Card", slug: "components/ui/card" },
					{ label: "Carousel", slug: "components/ui/carousel" },
					{ label: "Checkbox", slug: "components/ui/checkbox" },
					{ label: "Chart", slug: "components/ui/chart" },
					{ label: "Collapsible", slug: "components/ui/collapsible" },
					{ label: "Command", slug: "components/ui/command" },
					{ label: "Combobox", slug: "components/ui/combobox" },
					{ label: "Context Menu", slug: "components/ui/context-menu" },
					{ label: "Data Table", slug: "components/ui/data-table" },
					{ label: "Date Picker", slug: "components/ui/date-picker" },
					{ label: "Direction", slug: "components/ui/direction" },
					{ label: "Dialog", slug: "components/ui/dialog" },
					{ label: "Drawer", slug: "components/ui/drawer" },
					{ label: "Dropdown Menu", slug: "components/ui/dropdown-menu" },
					{ label: "Empty", slug: "components/ui/empty" },
					{ label: "Field", slug: "components/ui/field" },
					{ label: "Form", slug: "components/ui/form" },
					{ label: "Hover Card", slug: "components/ui/hover-card" },
					{ label: "Icons", slug: "components/ui/icon" },
					{ label: "Input", slug: "components/ui/input" },
					{ label: "Input Group", slug: "components/ui/input-group" },
					{ label: "Input OTP", slug: "components/ui/input-otp" },
					{ label: "Item", slug: "components/ui/item" },
					{ label: "Kbd", slug: "components/ui/kbd" },
					{ label: "Label", slug: "components/ui/label" },
					{ label: "Menubar", slug: "components/ui/menubar" },
					{ label: "Mode Switcher", slug: "components/ui/mode-switcher" },
					{ label: "Navbar", slug: "components/ui/navbar" },
					{ label: "Native Select", slug: "components/ui/native-select" },
					{ label: "Navigation Menu", slug: "components/ui/navigation-menu" },
					{ label: "Pagination", slug: "components/ui/pagination" },
					{ label: "Popover", slug: "components/ui/popover" },
					{ label: "Progress", slug: "components/ui/progress" },
					{ label: "Radio Group", slug: "components/ui/radio-group" },
					{ label: "Range Calendar", slug: "components/ui/range-calendar" },
					{ label: "Resizable", slug: "components/ui/resizable" },
					{ label: "Scroll Area", slug: "components/ui/scroll-area" },
					{ label: "Select", slug: "components/ui/select" },
					{ label: "Separator", slug: "components/ui/separator" },
					{ label: "Sidebar", slug: "components/ui/sidebar" },
					{ label: "Skeleton", slug: "components/ui/skeleton" },
					{ label: "Slider", slug: "components/ui/slider" },
					{ label: "Sonner", slug: "components/ui/sonner" },
					{ label: "Spinner", slug: "components/ui/spinner" },
					{ label: "Switch", slug: "components/ui/switch" },
					{ label: "Table", slug: "components/ui/table" },
					{ label: "Tabs", slug: "components/ui/tabs" },
					{ label: "Textarea", slug: "components/ui/textarea" },
					{ label: "Toggle", slug: "components/ui/toggle" },
					{ label: "Toggle Group", slug: "components/ui/toggle-group" },
					{ label: "Tooltip", slug: "components/ui/tooltip" },
					{ label: "Typography", slug: "components/ui/typography" },
				],
			},
		],
	},
	{
		label: "Blocks",
		labelId: "Blok",
		items: [
			{ label: "Overview", labelId: "Ringkasan", slug: "blocks/overview" },
			{
				label: "Cards",
				children: [
					{ label: "Data & Dashboard", slug: "blocks/cards/data" },
					{ label: "People", slug: "blocks/cards/people" },
					{ label: "Commerce", slug: "blocks/cards/commerce" },
					{ label: "Media", slug: "blocks/cards/media" },
					{ label: "Utility & System", slug: "blocks/cards/utility" },
					{ label: "Auth & Marketing", slug: "blocks/cards/auth" },
				],
			},
			{
				label: "Heros — Commerce",
				children: [
					{ label: "Shop Split", slug: "blocks/heros/shop-split" },
					{ label: "Sale", slug: "blocks/heros/sale" },
					{ label: "Bags", slug: "blocks/heros/bags" },
					{ label: "Bookstore", slug: "blocks/heros/bookstore" },
					{ label: "Toys", slug: "blocks/heros/toys" },
					{ label: "Home Goods", slug: "blocks/heros/home-goods" },
					{ label: "Apparel", slug: "blocks/heros/apparel" },
				],
			},
			{
				label: "Heros — Education",
				children: [
					{ label: "Course", slug: "blocks/heros/course" },
					{ label: "Campus", slug: "blocks/heros/campus" },
				],
			},
			{
				label: "Heros — Food",
				children: [
					{ label: "Restaurant", slug: "blocks/heros/restaurant" },
					{ label: "Delivery", slug: "blocks/heros/delivery" },
				],
			},
			{
				label: "Heros — Fashion",
				children: [
					{ label: "Lookbook", slug: "blocks/heros/lookbook" },
					{ label: "New Drop", slug: "blocks/heros/new-drop" },
				],
			},
			{
				label: "Heros — Services",
				children: [
					{ label: "Agency", slug: "blocks/heros/agency" },
					{ label: "Consulting", slug: "blocks/heros/consulting" },
				],
			},
			{
				label: "Heros — SaaS",
				children: [
					{ label: "App", slug: "blocks/heros/app" },
					{ label: "Product", slug: "blocks/heros/product" },
				],
			},
			{
				label: "Navbars",
				children: [
					{ label: "Standard", slug: "blocks/navbars/standard" },
					{ label: "Themes", slug: "blocks/navbars/themes" },
					{ label: "App & Interactive", slug: "blocks/navbars/app" },
				],
			},
			{ label: "Docks", slug: "blocks/docks" },
			{
				label: "Footers",
				children: [
					{ label: "Standard", slug: "blocks/footers/standard" },
					{ label: "Themes", slug: "blocks/footers/themes" },
				],
			},
			{
				label: "Sections",
				children: [
					{ label: "Pricing", slug: "blocks/pricing" },
					{ label: "Testimonials", slug: "blocks/testimonials" },
					{ label: "FAQ", slug: "blocks/faq" },
					{ label: "CTA", slug: "blocks/cta" },
					{ label: "Features", slug: "blocks/features" },
					{ label: "Stats", slug: "blocks/stats" },
					{ label: "Logos", slug: "blocks/logos" },
					{ label: "Contact", labelId: "Kontak", slug: "blocks/contact" },
					{ label: "Team", labelId: "Tim", slug: "blocks/team" },
				],
			},
			{
				label: "Files",
				children: [
					{ label: "Crop Image", slug: "blocks/files/crop-image" },
					{ label: "Image Dialog", slug: "blocks/files/image-dialog" },
					{ label: "Upload Area", slug: "blocks/files/upload-area" },
				],
			},
			{
				label: "Storefront",
				children: [
					{ label: "Layout", slug: "blocks/storefront/layout" },
					{ label: "Home Sections", slug: "blocks/storefront/home" },
					{ label: "Catalog & Cart", slug: "blocks/storefront/catalog" },
					{ label: "Listing", slug: "blocks/storefront/listing" },
					{ label: "Product Page", slug: "blocks/storefront/product" },
					{ label: "Cart & Wishlist", slug: "blocks/storefront/cart-wishlist" },
					{ label: "Checkout", slug: "blocks/storefront/checkout" },
					{ label: "Account", slug: "blocks/storefront/account" },
				],
			},
			{
				label: "Auth",
				children: [{ label: "Auth Blocks", slug: "blocks/auth" }],
			},
		],
	},
	{
		label: "Pages",
		labelId: "Halaman",
		items: [
			{ label: "Overview", labelId: "Ringkasan", slug: "pages/overview" },
			{
				label: "Storefront",
				children: [
					{ label: "Home", slug: "pages/storefront/home" },
					{ label: "Listing", slug: "pages/storefront/listing" },
					{ label: "Search", slug: "pages/storefront/search" },
					{ label: "Product", slug: "pages/storefront/product" },
					{ label: "Cart", slug: "pages/storefront/cart" },
					{ label: "Wishlist", slug: "pages/storefront/wishlist" },
					{ label: "Checkout", slug: "pages/storefront/checkout" },
					{ label: "Account", slug: "pages/storefront/account" },
				],
			},
			{
				label: "Auth",
				children: [
					{ label: "Login", slug: "pages/auth/login" },
					{ label: "Register", slug: "pages/auth/register" },
					{ label: "Forgot Password", slug: "pages/auth/forgot" },
					{ label: "Magic Link", slug: "pages/auth/magic-link" },
					{ label: "OTP / 2FA", slug: "pages/auth/otp" },
					{ label: "SSO", slug: "pages/auth/sso" },
				],
			},
			{
				label: "Landing",
				children: [
					{ label: "SaaS Landing", slug: "pages/landing/saas" },
					{ label: "Simple Landing", slug: "pages/landing/simple" },
				],
			},
			{
				label: "Company",
				labelId: "Perusahaan",
				children: [
					{ label: "About", labelId: "Tentang", slug: "pages/company/about" },
					{ label: "Contact", labelId: "Kontak", slug: "pages/company/contact" },
				],
			},
		],
	},
	{
		label: "Themes",
		labelId: "Tema",
		items: [
			{ label: "Overview", labelId: "Ringkasan", slug: "themes/overview" },
			{ label: "Neutral", slug: "themes/neutral" },
			{ label: "Editorial", slug: "themes/editorial" },
			{ label: "Zinc", slug: "themes/zinc" },
			{ label: "Stone", slug: "themes/stone" },
			{ label: "Claude", slug: "themes/claude" },
			{ label: "Ocean", slug: "themes/ocean" },
			{ label: "Forest", slug: "themes/forest" },
			{ label: "Rose", slug: "themes/rose" },
			{ label: "Sunset", slug: "themes/sunset" },
			{ label: "Midnight", slug: "themes/midnight" },
			{ label: "Mono", slug: "themes/mono" },
			{ label: "Amber", slug: "themes/amber" },
			{ label: "Paper", slug: "themes/paper" },
			{ label: "Carbon", slug: "themes/carbon" },
			{ label: "Bloom", slug: "themes/bloom" },
			{ label: "Terminal", slug: "themes/terminal" },
			{ label: "Sage", slug: "themes/sage" },
			{ label: "Grape", slug: "themes/grape" },
			{ label: "Clay", slug: "themes/clay" },
			{
				label: "Creating Themes",
				labelId: "Membuat Tema",
				slug: "themes/creating-themes",
			},
		],
	},
	{
		label: "Reference",
		labelId: "Referensi",
		items: [
			{ label: "CLI", slug: "reference/cli" },
			{ label: "API Reference", labelId: "Referensi API", slug: "reference/api" },
			{ label: "Deployment", slug: "reference/deployment" },
			{
				label: "SvelteKit Differences",
				labelId: "Perbedaan dengan SvelteKit",
				slug: "reference/sveltekit-differences",
			},
			{ label: "Roadmap", slug: "reference/roadmap" },
			{ label: "Changelog", slug: "reference/changelog" },
		],
	},
];
