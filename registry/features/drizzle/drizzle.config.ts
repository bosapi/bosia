import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/features/drizzle/schemas.ts",
	out: "./src/features/drizzle/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
