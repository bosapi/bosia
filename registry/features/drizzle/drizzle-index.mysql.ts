import { drizzle, type BunSQLDatabase } from "drizzle-orm/bun-sql";
import * as schema from "./schemas";

export type Engine = "mysql";
export const engine: Engine = "mysql";
export const isPersistent = true;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.warn("⚠️  DATABASE_URL is not set. Database queries will fail.");
}

const url = connectionString || "mysql://root@localhost:3306/app";

function buildClient() {
	const u = new URL(url);
	const opts = {
		hostname: u.hostname,
		port: u.port ? Number(u.port) : 3306,
		user: u.username ? decodeURIComponent(u.username) : undefined,
		password: u.password ? decodeURIComponent(u.password) : undefined,
		database: u.pathname.slice(1) || undefined,
	};
	return new (Bun as unknown as { SQL: new (o: unknown) => unknown }).SQL(opts);
}

export const db: BunSQLDatabase<typeof schema> = drizzle(buildClient() as never, { schema });

export type Database = typeof db;
