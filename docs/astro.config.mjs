import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://bosia.bosapi.com",
  integrations: [
    starlight({
      title: "Bosia",
      logo: {
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
      },
      description:
        "Fast, batteries-included fullstack framework built on Bun + Svelte 5 + ElysiaJS",
      defaultLocale: "root",
      locales: {
        root: { label: "English", lang: "en" },
        id: { label: "Bahasa Indonesia", lang: "id" },
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/bosapi/bosia",
        },
      ],
      sidebar: [
        {
          label: "Start Here",
          translations: { id: "Mulai di Sini" },
          items: [
            {
              label: "Introduction",
              translations: { id: "Pengenalan" },
              slug: "",
            },
            {
              label: "Getting Started",
              translations: { id: "Memulai" },
              slug: "getting-started",
            },
            {
              label: "Project Structure",
              translations: { id: "Struktur Proyek" },
              slug: "project-structure",
            },
          ],
        },
        {
          label: "Guides",
          translations: { id: "Panduan" },
          items: [
            {
              label: "Routing",
              translations: { id: "Routing" },
              slug: "guides/routing",
            },
            {
              label: "Server Loaders",
              translations: { id: "Server Loader" },
              slug: "guides/server-loaders",
            },
            {
              label: "API Routes",
              translations: { id: "API Route" },
              slug: "guides/api-routes",
            },
            {
              label: "Form Actions",
              translations: { id: "Form Action" },
              slug: "guides/form-actions",
            },
            {
              label: "Middleware Hooks",
              translations: { id: "Middleware Hook" },
              slug: "guides/middleware-hooks",
            },
            {
              label: "Environment Variables",
              translations: { id: "Variabel Lingkungan" },
              slug: "guides/environment-variables",
            },
            {
              label: "Styling",
              translations: { id: "Styling" },
              slug: "guides/styling",
            },
            {
              label: "Security",
              translations: { id: "Keamanan" },
              slug: "guides/security",
            },
          ],
        },
        {
          label: "Components",
          translations: { id: "Komponen" },
          items: [
            {
              label: "Overview",
              translations: { id: "Ringkasan" },
              slug: "components/overview",
            },
            {
              label: "Button",
              slug: "components/button",
            },
            {
              label: "Badge",
              slug: "components/badge",
            },
            {
              label: "Card",
              slug: "components/card",
            },
            {
              label: "Input",
              slug: "components/input",
            },
            {
              label: "Avatar",
              slug: "components/avatar",
            },
            {
              label: "Separator",
              slug: "components/separator",
            },
            {
              label: "Icon",
              slug: "components/icon",
            },
            {
              label: "Dropdown Menu",
              slug: "components/dropdown-menu",
            },
            {
              label: "Data Table",
              slug: "components/data-table",
            },
          ],
        },
        {
          label: "Reference",
          translations: { id: "Referensi" },
          items: [
            {
              label: "CLI",
              translations: { id: "CLI" },
              slug: "reference/cli",
            },
            {
              label: "API Reference",
              translations: { id: "Referensi API" },
              slug: "reference/api",
            },
            {
              label: "Deployment",
              translations: { id: "Deployment" },
              slug: "reference/deployment",
            },
            {
              label: "SvelteKit Differences",
              translations: { id: "Perbedaan dengan SvelteKit" },
              slug: "reference/sveltekit-differences",
            },
            {
              label: "Roadmap",
              translations: { id: "Roadmap" },
              slug: "reference/roadmap",
            },
            {
              label: "Changelog",
              translations: { id: "Changelog" },
              slug: "reference/changelog",
              badge: { text: "v0.1.0", variant: "tip" },
            },
          ],
        },
      ],
    }),
  ],
});
