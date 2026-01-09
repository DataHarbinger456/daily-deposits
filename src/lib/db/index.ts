import * as schema from './schema';

// Only initialize database at runtime, not at build time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

function getDb() {
  if (db === null && typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');

    const dbPath = path.join(process.cwd(), 'dev.db');
    const sqlite = new Database(dbPath);
    db = drizzle(sqlite, { schema });
  }
  return db;
}

export { getDb, schema };
export * from './schema';
