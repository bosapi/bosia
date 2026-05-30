import * as schema from "./schemas";

export type Engine = "postgres" | "mysql" | "sqlite-file" | "sqlite-memory";

export function resolveEngine(url: string): Engine {
	if (url.startsWith("postgres://") || url.startsWith("postgresql://")) return "postgres";
	if (url.startsWith("mysql://")) return "mysql";
	if (url === "sqlite://:memory:") return "sqlite-memory";
	if (url.startsWith("sqlite://")) return "sqlite-file";
	throw new Error(
		`Unknown DATABASE_URL scheme: ${url.split("://")[0] || "<empty>"}. ` +
			`Expected postgres:// | postgresql:// | mysql:// | sqlite://./path | sqlite://:memory:`,
	);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	console.warn("⚠️  DATABASE_URL is not set. Database queries will fail.");
}

const url = connectionString || "sqlite://./data/app.db";
export const engine: Engine = resolveEngine(url);
export const isPersistent = engine !== "sqlite-memory";

function build() {
	if (engine === "postgres" || engine === "mysql") {
		// Bun.SQL covers both postgres and mysql via URL scheme.
		const { drizzle } = require("drizzle-orm/bun-sql") as typeof import("drizzle-orm/bun-sql");
		const client = new (Bun as unknown as { SQL: new (u: string) => unknown }).SQL(url);
		return drizzle(client as never, { schema });
	}

	const { Database } = require("bun:sqlite") as typeof import("bun:sqlite");
	const { drizzle } =
		require("drizzle-orm/bun-sqlite") as typeof import("drizzle-orm/bun-sqlite");
	const path = engine === "sqlite-memory" ? ":memory:" : url.replace(/^sqlite:\/\//, "");
	if (engine === "sqlite-memory") {
		console.warn("⚠️  Using sqlite in-memory — data is ephemeral and flushes on restart.");
	}
	const sqlite = new Database(path);
	return drizzle(sqlite, { schema });
}

export const db = build();

export type Database = typeof db;
