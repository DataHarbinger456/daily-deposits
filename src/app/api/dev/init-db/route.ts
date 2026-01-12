import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

/**
 * DEVELOPMENT ONLY: Initialize database with all tables
 * POST /api/dev/init-db
 */
export async function POST() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Only available in development' },
        { status: 403 }
      );
    }

    const dbPath = path.join(process.cwd(), 'dev.db');
    const sqlite = new Database(dbPath);

    // Enable foreign keys
    sqlite.pragma('foreign_keys = ON');

    // Create users table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        user_type TEXT NOT NULL DEFAULT 'business_owner',
        industry TEXT DEFAULT 'general',
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
        webhook_url TEXT,
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
        email TEXT,
        phone TEXT,
        estimate_status TEXT NOT NULL DEFAULT 'PENDING',
        close_status TEXT NOT NULL DEFAULT 'OPEN',
        estimate_amount REAL,
        revenue REAL,
        notes TEXT,
        created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(org_id) REFERENCES orgs(id) ON DELETE CASCADE
      );
    `);

    sqlite.close();

    return NextResponse.json({
      message: 'Database initialized successfully',
      location: dbPath,
    });
  } catch (error) {
    console.error('Init DB error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
