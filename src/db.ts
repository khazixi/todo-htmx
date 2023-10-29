import { drizzle } from 'drizzle-orm/better-sqlite3';
// import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
 
export const sqlite = new Database('./src/storage.db');
export const db = drizzle(sqlite);

// NOTE: Maybe migrations can be handled by drizzle cli?
// migrate(db, { migrationsFolder: "drizzle" })
