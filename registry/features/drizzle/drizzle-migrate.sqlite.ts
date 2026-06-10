import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db, engine } from "./index";

const MIGRATIONS_FOLDER = "./src/features/drizzle/migrations";

async function run() {
	console.log(`Running migrations (engine: ${engine}) from ${MIGRATIONS_FOLDER} ...`);
	if (engine === "sqlite-memory") {
		console.warn("⚠️  sqlite-memory: schema applies to ephemeral DB and is lost on restart.");
	}
	migrate(db as never, { migrationsFolder: MIGRATIONS_FOLDER });
	console.log("Done.");
	process.exit(0);
}

run().catch((err) => {
	console.error("Migration failed:", err);
	process.exit(1);
});
