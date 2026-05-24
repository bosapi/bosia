import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL || "sqlite://:memory:";

type Dialect = "postgresql" | "mysql" | "sqlite";

function dialectFor(u: string): Dialect {
	if (u.startsWith("postgres://") || u.startsWith("postgresql://")) return "postgresql";
	if (u.startsWith("mysql://")) return "mysql";
	if (u.startsWith("sqlite://")) return "sqlite";
	throw new Error(
		`Unknown DATABASE_URL scheme: ${u.split("://")[0] || "<empty>"}. ` +
			`Expected postgres:// | postgresql:// | mysql:// | sqlite://./path | sqlite://:memory:`,
	);
}

const dialect = dialectFor(url);

const credentials =
	dialect === "sqlite"
		? { url: url === "sqlite://:memory:" ? ":memory:" : url.replace(/^sqlite:\/\//, "") }
		: { url };

export default defineConfig({
	schema: "./src/features/drizzle/schemas.ts",
	out: "./src/features/drizzle/migrations",
	dialect,
	dbCredentials: credentials,
});
