import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'dev.db');
console.log(`Seeding demo data to ${dbPath}...`);

const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

const DEMO_ORG_ID = 'org_demo_123';
const DEMO_USER_ID = 'user_demo_123';

// Insert demo user first
sqlite
  .prepare(
    `INSERT OR IGNORE INTO users (id, email, password, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
  )
  .run(
    DEMO_USER_ID,
    'demo@example.com',
    'demo_password_hashed',
    'Demo User',
    Date.now(),
    Date.now()
  );

console.log('✓ Demo user created');

// Insert demo org
sqlite
  .prepare(
    `INSERT OR IGNORE INTO orgs (id, name, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`
  )
  .run(DEMO_ORG_ID, 'Demo Tree Service', DEMO_USER_ID, Date.now(), Date.now());

console.log('✓ Demo org created');

// Insert demo services
const services = [
  'Tree Trimming',
  'Tree Removal',
  'Stump Grinding',
  'Pruning',
  'Emergency Removal',
];

const serviceStmt = sqlite.prepare(
  `INSERT OR IGNORE INTO services (id, name, org_id, created_at) VALUES (?, ?, ?, ?)`
);

services.forEach((service) => {
  const id = `srv_${Math.random().toString(36).slice(2, 9)}`;
  serviceStmt.run(id, service, DEMO_ORG_ID, Date.now());
});

console.log(`✓ ${services.length} services created`);

// Insert demo sources
const sources = [
  'Google Ads',
  'Facebook Ads',
  'Referral',
  'Website',
  'Direct Call',
];

const sourceStmt = sqlite.prepare(
  `INSERT OR IGNORE INTO sources (id, name, org_id, created_at) VALUES (?, ?, ?, ?)`
);

sources.forEach((source) => {
  const id = `src_${Math.random().toString(36).slice(2, 9)}`;
  sourceStmt.run(id, source, DEMO_ORG_ID, Date.now());
});

console.log(`✓ ${sources.length} sources created`);

// Insert demo leads
const sampleLeads = [
  {
    service: 'Tree Trimming',
    source: 'Google Ads',
    contactName: 'John Rodriguez',
    estimateStatus: 'PENDING',
  },
  {
    service: 'Tree Removal',
    source: 'Facebook Ads',
    contactName: 'Sarah Johnson',
    estimateStatus: 'SCHEDULED',
  },
  {
    service: 'Stump Grinding',
    source: 'Referral',
    contactName: 'Mike Chen',
    estimateStatus: 'PENDING',
  },
  {
    service: 'Tree Trimming',
    source: 'Website',
    contactName: 'Lisa Martinez',
    estimateStatus: 'COMPLETED',
  },
  {
    service: 'Emergency Removal',
    source: 'Direct Call',
    contactName: 'Tom Wilson',
    estimateStatus: 'PENDING',
  },
  {
    service: 'Pruning',
    source: 'Google Ads',
    contactName: 'Jennifer Lee',
    estimateStatus: 'SCHEDULED',
  },
  {
    service: 'Tree Trimming',
    source: 'Referral',
    contactName: 'David Brown',
    estimateStatus: 'PENDING',
  },
  {
    service: 'Stump Grinding',
    source: 'Facebook Ads',
    contactName: 'Amanda Clark',
    estimateStatus: 'SCHEDULED',
  },
];

const leadStmt = sqlite.prepare(
  `INSERT INTO leads (id, org_id, service, source, contact_name, estimate_status, close_status, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

sampleLeads.forEach((lead) => {
  const id = `lead_${Math.random().toString(36).slice(2, 9)}`;
  leadStmt.run(
    id,
    DEMO_ORG_ID,
    lead.service,
    lead.source,
    lead.contactName,
    lead.estimateStatus,
    'OPEN',
    Date.now(),
    Date.now()
  );
});

console.log(`✓ ${sampleLeads.length} demo leads created`);

console.log('\n✅ Demo data seeded successfully!');
console.log(`\nDemo Org ID: ${DEMO_ORG_ID}`);
console.log('Visit http://localhost:3003/dashboard/leads to see the leads');

sqlite.close();
