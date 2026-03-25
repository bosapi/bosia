import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://bosapi.github.io",
  base: "/bosbun",
  integrations: [
    starlight({
      title: "Bosbun",
      description:
        "Fast, batteries-included fullstack framework built on Bun + Svelte 5 + ElysiaJS",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/bosapi/bosbun",
        },
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Introduction", slug: "" },
            { label: "Getting Started", slug: "getting-started" },
            { label: "Project Structure", slug: "project-structure" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Routing", slug: "guides/routing" },
            { label: "Server Loaders", slug: "guides/server-loaders" },
            { label: "API Routes", slug: "guides/api-routes" },
            { label: "Form Actions", slug: "guides/form-actions" },
            { label: "Middleware Hooks", slug: "guides/middleware-hooks" },
            {
              label: "Environment Variables",
              slug: "guides/environment-variables",
            },
            { label: "Styling", slug: "guides/styling" },
            { label: "Security", slug: "guides/security" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "CLI", slug: "reference/cli" },
            { label: "API Reference", slug: "reference/api" },
            { label: "Deployment", slug: "reference/deployment" },
            {
              label: "SvelteKit Differences",
              slug: "reference/sveltekit-differences",
            },
          ],
        },
      ],
    }),
  ],
});
