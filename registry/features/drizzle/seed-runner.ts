import { sql } from "drizzle-orm";
import { db } from "../index";

// Seed tracking table in the "drizzle" schema (same schema Drizzle Kit uses for migrations)
const SEEDS_TABLE = "__bosia_seeds";

interface SeedModule {
	seed: (db: typeof import("../index").db) => Promise<void>;
}

async function ensureSeedsTable() {
	await db.execute(sql`
        CREATE SCHEMA IF NOT EXISTS drizzle
    `);
	await db.execute(sql`
        CREATE TABLE IF NOT EXISTS drizzle.${sql.identifier(SEEDS_TABLE)} (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    `);
}

async function getAppliedSeeds(): Promise<Set<string>> {
	const rows = await db.execute<{ name: string }>(
		sql`SELECT name FROM drizzle.${sql.identifier(SEEDS_TABLE)} ORDER BY id`,
	);
	return new Set(rows.map((r) => r.name));
}

async function markSeedApplied(name: string) {
	await db.execute(
		sql`INSERT INTO drizzle.${sql.identifier(SEEDS_TABLE)} (name) VALUES (${name})`,
	);
}

async function run() {
	console.log("Running seeds...\n");

	await ensureSeedsTable();
	const applied = await getAppliedSeeds();

	// Discover seed files (*.ts, excluding runner.ts)
	const glob = new Bun.Glob("*.ts");
	const seedDir = import.meta.dir;
	const files = Array.from(glob.scanSync(seedDir))
		.filter((f) => f !== "runner.ts")
		.sort();

	let count = 0;

	for (const file of files) {
		const name = file.replace(/\.ts$/, "");

		if (applied.has(name)) {
			console.log(`  skip  ${name} (already applied)`);
			continue;
		}

		console.log(`  seed  ${name}`);
		const mod: SeedModule = await import(`./${file}`);

		if (typeof mod.seed !== "function") {
			console.error(`  ERROR  ${file} does not export a seed() function, skipping`);
			continue;
		}

		await mod.seed(db);
		await markSeedApplied(name);
		count++;
	}

	console.log(`\nDone. Applied ${count} seed(s).`);
	process.exit(0);
}

run().catch((err) => {
	console.error("Seed runner failed:", err);
	process.exit(1);
});
