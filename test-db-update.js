const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { sqliteTable, text, integer } = require('drizzle-orm/sqlite-core');
const { sql } = require('drizzle-orm');
const { eq } = require('drizzle-orm');
const path = require('path');

// Define the schema exactly as in schema.ts
const orgsTableSqlite = sqliteTable('orgs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
  webhookUrl: text('webhook_url'),
  companyTag: text('company_tag'),
  googleSheetsSpreadsheetId: text('google_sheets_spreadsheet_id'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

const dbPath = path.join(process.cwd(), 'dev.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema: { orgsTableSqlite } });

async function testUpdate() {
  try {
    console.log('Getting first org...');
    const orgs = await db.select().from(orgsTableSqlite).limit(1);

    if (orgs.length === 0) {
      console.log('No orgs found');
      return;
    }

    const org = orgs[0];
    console.log('\nOrg before update:');
    console.log(`  ID: ${org.id}`);
    console.log(`  Name: ${org.name}`);
    console.log(`  Google Sheets ID: ${org.googleSheetsSpreadsheetId}`);

    console.log('\nTrying to update...');
    const testSheetId = '1fPzS7Nhdu14Qij_5siC9Nj5fBJUjlGO70LZl_BW8rwM';
    const updated = await db
      .update(orgsTableSqlite)
      .set({ googleSheetsSpreadsheetId: testSheetId })
      .where(eq(orgsTableSqlite.id, org.id))
      .returning();

    console.log('Update response:', updated);

    console.log('\nOrg after update:');
    const updatedOrg = await db
      .select()
      .from(orgsTableSqlite)
      .where(eq(orgsTableSqlite.id, org.id))
      .limit(1);

    if (updatedOrg.length > 0) {
      console.log(`  ID: ${updatedOrg[0].id}`);
      console.log(`  Name: ${updatedOrg[0].name}`);
      console.log(`  Google Sheets ID: ${updatedOrg[0].googleSheetsSpreadsheetId}`);
    }

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testUpdate();
