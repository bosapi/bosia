import { migrate } from "drizzle-orm/bun-sql/migrator";
import { db, engine } from "./index";

const MIGRATIONS_FOLDER = "./src/features/drizzle/migrations";

async function run() {
	console.log(`Running migrations (engine: ${engine}) from ${MIGRATIONS_FOLDER} ...`);
	await migrate(db as never, { migrationsFolder: MIGRATIONS_FOLDER });
	console.log("Done.");
	process.exit(0);
}

run().catch((err) => {
	console.error("Migration failed:", err);
	process.exit(1);
});
