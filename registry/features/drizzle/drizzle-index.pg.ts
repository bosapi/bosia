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
		// The dev server holds this client for its whole lifetime. With the
		// default idleTimeout (0 = never), Bun keeps a pooled socket open
		// forever — but Postgres / the lima port-forward reaps idle sockets
		// after ~60s. Bun then still believes the dead socket is live, so the
		// next query (e.g. login/register after the server sat idle) fails with
		// `PostgresError: Connection closed`, surfaced as a misleading Drizzle
		// "Failed query: select ...". Closing idle sockets *before* the server
		// does means Bun always opens a fresh one on demand. maxLifetime recycles
		// long-lived sockets that never go fully idle.
		idleTimeout: 20,
		maxLifetime: 60 * 30,
		connectionTimeout: 30,
	};
	return new (Bun as unknown as { SQL: new (o: unknown) => unknown }).SQL(opts);
}

export const db: BunSQLDatabase<typeof schema> = drizzle(buildClient() as never, { schema });

export type Database = typeof db;
