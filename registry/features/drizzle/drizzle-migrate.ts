import { db, engine } from "./index";

const MIGRATIONS_FOLDER = "./src/features/drizzle/migrations";

async function run() {
	console.log(`Running migrations (engine: ${engine}) from ${MIGRATIONS_FOLDER} ...`);
	if (engine === "sqlite-memory") {
		console.warn("⚠️  sqlite-memory: schema applies to ephemeral DB and is lost on restart.");
	}
	if (engine === "postgres" || engine === "mysql") {
		const { migrate } = await import("drizzle-orm/bun-sql/migrator");
		await migrate(db as never, { migrationsFolder: MIGRATIONS_FOLDER });
	} else {
		const { migrate } = await import("drizzle-orm/bun-sqlite/migrator");
		migrate(db as never, { migrationsFolder: MIGRATIONS_FOLDER });
	}
	console.log("Done.");
	process.exit(0);
}

run().catch((err) => {
	console.error("Migration failed:", err);
	process.exit(1);
});
