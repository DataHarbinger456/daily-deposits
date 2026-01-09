import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'dev.db');
console.log(`Initializing database at ${dbPath}...`);

const sqlite = new Database(dbPath);

// Create tables by running migrations
// For SQLite with Drizzle, we need to execute the schema

// Create users table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Create sessions table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Create orgs table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS orgs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Create services table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    org_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(org_id) REFERENCES orgs(id) ON DELETE CASCADE
  );
`);

// Create sources table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    org_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(org_id) REFERENCES orgs(id) ON DELETE CASCADE
  );
`);

// Create leads table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    service TEXT NOT NULL,
    source TEXT NOT NULL,
    contact_name TEXT,
    estimate_status TEXT NOT NULL DEFAULT 'PENDING',
    close_status TEXT NOT NULL DEFAULT 'OPEN',
    revenue REAL,
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(org_id) REFERENCES orgs(id) ON DELETE CASCADE
  );
`);

console.log('✅ Database tables created successfully!');
sqlite.close();
