import { Database as SqliteDatabase } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import * as schema from "./schemas";

export type Engine = "sqlite-file" | "sqlite-memory";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.warn("⚠️  DATABASE_URL is not set. Database queries will fail.");
}

const url = connectionString || "sqlite://./data/app.db";
export const engine: Engine = url === "sqlite://:memory:" ? "sqlite-memory" : "sqlite-file";
export const isPersistent = engine !== "sqlite-memory";

function buildClient() {
	const path = engine === "sqlite-memory" ? ":memory:" : url.replace(/^sqlite:\/\//, "");
	if (engine === "sqlite-memory") {
		console.warn("⚠️  Using sqlite in-memory — data is ephemeral and flushes on restart.");
	} else {
		mkdirSync(dirname(path), { recursive: true });
	}
	return new SqliteDatabase(path);
}

export const db: BunSQLiteDatabase<typeof schema> = drizzle(buildClient(), { schema });

export type Database = typeof db;
