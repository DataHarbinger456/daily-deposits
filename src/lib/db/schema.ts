import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { pgTable, varchar, timestamp, real as pgReal } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Use SQLite for local development, PostgreSQL for production
const isProduction = process.env.DATABASE_URL?.includes('postgres');

// ============================================
// SQLite Schema
// ============================================

export const usersTableSqlite = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  companyName: text('company_name'),
  userType: text('user_type').default('business_owner').notNull(), // 'business_owner' | 'agency'
  industry: text('industry').default('general'), // hvac, plumbing, electrical, etc.
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const orgsTableSqlite = sqliteTable('orgs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => usersTableSqlite.id, { onDelete: 'cascade' }),
  webhookUrl: text('webhook_url'),
  companyTag: text('company_tag'), // nullable, lowercase with spaces
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const servicesTableSqlite = sqliteTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  orgId: text('org_id')
    .notNull()
    .references(() => orgsTableSqlite.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const sourcesTableSqlite = sqliteTable('sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  orgId: text('org_id')
    .notNull()
    .references(() => orgsTableSqlite.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const leadsTableSqlite = sqliteTable('leads', {
  id: text('id').primaryKey(),
  orgId: text('org_id')
    .notNull()
    .references(() => orgsTableSqlite.id, { onDelete: 'cascade' }),
  service: text('service').notNull(), // service name
  source: text('source').notNull(), // source name
  contactName: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
  estimateStatus: text('estimate_status')
    .default('PENDING')
    .notNull(), // PENDING, SCHEDULED, COMPLETED, NO_SHOW
  closeStatus: text('close_status')
    .default('OPEN')
    .notNull(), // OPEN, WON, LOST
  estimateAmount: real('estimate_amount'), // estimated cost/quote amount
  revenue: real('revenue'),
  notes: text('notes'),
  tags: text('tags'), // JSON array stored as text, e.g., '["elite tree services"]'
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// ============================================
// PostgreSQL Schema (for production)
// ============================================

export const usersTablePostgres = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  companyName: varchar('company_name', { length: 255 }),
  userType: varchar('user_type', { length: 50 }).default('business_owner').notNull(), // 'business_owner' | 'agency'
  industry: varchar('industry', { length: 50 }).default('general'), // hvac, plumbing, electrical, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orgsTablePostgres = pgTable('orgs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => usersTablePostgres.id, { onDelete: 'cascade' }),
  webhookUrl: varchar('webhook_url', { length: 500 }),
  companyTag: varchar('company_tag', { length: 255 }), // nullable
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const servicesTablePostgres = pgTable('services', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  orgId: varchar('org_id', { length: 255 })
    .notNull()
    .references(() => orgsTablePostgres.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sourcesTablePostgres = pgTable('sources', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  orgId: varchar('org_id', { length: 255 })
    .notNull()
    .references(() => orgsTablePostgres.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leadsTablePostgres = pgTable('leads', {
  id: varchar('id', { length: 255 }).primaryKey(),
  orgId: varchar('org_id', { length: 255 })
    .notNull()
    .references(() => orgsTablePostgres.id, { onDelete: 'cascade' }),
  service: varchar('service', { length: 255 }).notNull(),
  source: varchar('source', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  estimateStatus: varchar('estimate_status', { length: 50 })
    .default('PENDING')
    .notNull(),
  closeStatus: varchar('close_status', { length: 50 })
    .default('OPEN')
    .notNull(),
  estimateAmount: pgReal('estimate_amount'),
  revenue: pgReal('revenue'),
  notes: varchar('notes', { length: 1000 }),
  tags: varchar('tags', { length: 1000 }), // JSON array as text
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Export appropriate tables based on environment
// ============================================

export const usersTable = isProduction ? usersTablePostgres : usersTableSqlite;
export const orgsTable = isProduction ? orgsTablePostgres : orgsTableSqlite;
export const servicesTable = isProduction ? servicesTablePostgres : servicesTableSqlite;
export const sourcesTable = isProduction ? sourcesTablePostgres : sourcesTableSqlite;
export const leadsTable = isProduction ? leadsTablePostgres : leadsTableSqlite;

// ============================================
// Types
// ============================================

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Org = typeof orgsTable.$inferSelect;
export type NewOrg = typeof orgsTable.$inferInsert;
export type Service = typeof servicesTable.$inferSelect;
export type NewService = typeof servicesTable.$inferInsert;
export type Source = typeof sourcesTable.$inferSelect;
export type NewSource = typeof sourcesTable.$inferInsert;
export type Lead = typeof leadsTable.$inferSelect;
export type NewLead = typeof leadsTable.$inferInsert;
