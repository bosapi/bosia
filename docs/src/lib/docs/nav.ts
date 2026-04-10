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
            { label: "Server Loaders", labelId: "Server Loader", slug: "guides/server-loaders" },
            { label: "Server Metadata", labelId: "Server Metadata", slug: "guides/server-metadata" },
            { label: "API Routes", labelId: "API Route", slug: "guides/api-routes" },
            { label: "Form Actions", labelId: "Form Action", slug: "guides/form-actions" },
            { label: "Middleware Hooks", labelId: "Middleware Hook", slug: "guides/middleware-hooks" },
            { label: "Environment Variables", labelId: "Variabel Lingkungan", slug: "guides/environment-variables" },
            { label: "Styling", slug: "guides/styling" },
            { label: "Security", labelId: "Keamanan", slug: "guides/security" },
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
                    { label: "Alert", slug: "components/ui/alert" },
                    { label: "Alert Dialog", slug: "components/ui/alert-dialog" },
                    { label: "Avatar", slug: "components/ui/avatar" },
                    { label: "Badge", slug: "components/ui/badge" },
                    { label: "Breadcrumb", slug: "components/ui/breadcrumb" },
                    { label: "Button", slug: "components/ui/button" },
                    { label: "Card", slug: "components/ui/card" },
                    { label: "Checkbox", slug: "components/ui/checkbox" },
                    { label: "Chart", slug: "components/ui/chart" },
                    { label: "Data Table", slug: "components/ui/data-table" },
                    { label: "Dialog", slug: "components/ui/dialog" },
                    { label: "Dropdown Menu", slug: "components/ui/dropdown-menu" },
                    { label: "Field", slug: "components/ui/field" },
                    { label: "Hover Card", slug: "components/ui/hover-card" },
                    { label: "Icon", slug: "components/ui/icon" },
                    { label: "Input", slug: "components/ui/input" },
                    { label: "Label", slug: "components/ui/label" },
                    { label: "Navbar", slug: "components/ui/navbar" },
                    { label: "Popover", slug: "components/ui/popover" },
                    { label: "Progress", slug: "components/ui/progress" },
                    { label: "Radio Group", slug: "components/ui/radio-group" },
                    { label: "Select", slug: "components/ui/select" },
                    { label: "Separator", slug: "components/ui/separator" },
                    { label: "Skeleton", slug: "components/ui/skeleton" },
                    { label: "Sonner", slug: "components/ui/sonner" },
                    { label: "Spinner", slug: "components/ui/spinner" },
                    { label: "Switch", slug: "components/ui/switch" },
                    { label: "Tabs", slug: "components/ui/tabs" },
                    { label: "Textarea", slug: "components/ui/textarea" },
                    { label: "Toggle", slug: "components/ui/toggle" },
                    { label: "Toggle Group", slug: "components/ui/toggle-group" },
                    { label: "Tooltip", slug: "components/ui/tooltip" },
                    { label: "Sidebar", slug: "components/ui/sidebar" },
                    { label: "Slider", slug: "components/ui/slider" },
                ],
            },
            {
                label: "Todo",
                children: [
                    { label: "Todo Form", slug: "components/todo/todo-form" },
                    { label: "Todo Item", slug: "components/todo/todo-item" },
                    { label: "Todo List", slug: "components/todo/todo-list" },
                ],
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
            { label: "SvelteKit Differences", labelId: "Perbedaan dengan SvelteKit", slug: "reference/sveltekit-differences" },
            { label: "Roadmap", slug: "reference/roadmap" },
            { label: "Changelog", slug: "reference/changelog" },
        ],
    },
];
