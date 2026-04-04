import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schemas";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn("⚠️  DATABASE_URL is not set. Database queries will fail.");
}

const client = postgres(connectionString || "postgres://localhost/dummy");

export const db = drizzle(client, { schema });

export type Database = typeof db;
