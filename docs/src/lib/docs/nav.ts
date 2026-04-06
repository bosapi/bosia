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
                    { label: "Avatar", slug: "components/ui/avatar" },
                    { label: "Badge", slug: "components/ui/badge" },
                    { label: "Button", slug: "components/ui/button" },
                    { label: "Card", slug: "components/ui/card" },
                    { label: "Chart", slug: "components/ui/chart" },
                    { label: "Data Table", slug: "components/ui/data-table" },
                    { label: "Dropdown Menu", slug: "components/ui/dropdown-menu" },
                    { label: "Icon", slug: "components/ui/icon" },
                    { label: "Input", slug: "components/ui/input" },
                    { label: "Navbar", slug: "components/ui/navbar" },
                    { label: "Separator", slug: "components/ui/separator" },
                    { label: "Sidebar", slug: "components/ui/sidebar" },
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
