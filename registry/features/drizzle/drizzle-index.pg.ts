import { drizzle, type BunSQLDatabase } from "drizzle-orm/bun-sql";
import * as schema from "./schemas";

export type Engine = "postgres";
export const engine: Engine = "postgres";
export const isPersistent = true;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.warn("⚠️  DATABASE_URL is not set. Database queries will fail.");
}

const url = connectionString || "postgresql://postgres@localhost:5432/postgres";

// Bun 1.3.x has a bug where `new Bun.SQL("postgres://...")` errors
// `FailedToOpenSocket` even on valid URLs. The object form works, so parse
// the URL ourselves.
function buildClient() {
	const u = new URL(url);
	const opts = {
		hostname: u.hostname,
		port: u.port ? Number(u.port) : 5432,
		user: u.username ? decodeURIComponent(u.username) : undefined,
		password: u.password ? decodeURIComponent(u.password) : undefined,
		database: u.pathname.slice(1) || undefined,
	};
	return new (Bun as unknown as { SQL: new (o: unknown) => unknown }).SQL(opts);
}

export const db: BunSQLDatabase<typeof schema> = drizzle(buildClient() as never, { schema });

export type Database = typeof db;
