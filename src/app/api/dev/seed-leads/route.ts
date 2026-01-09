import { NextResponse } from 'next/server';
import { getDb, leadsTable, orgsTable, servicesTable, sourcesTable } from '@/lib/db';
import { generateIdFromEntropySize } from 'lucia';
import { eq } from 'drizzle-orm';

/**
 * DEVELOPMENT ONLY: Seed test data for the demo org
 * This endpoint creates sample leads for testing the CRM
 */
export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Only available in development' },
        { status: 403 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const DEMO_ORG_ID = 'org_demo_123';
    const DEMO_USER_ID = 'user_demo_123';

    // Check if org exists, if not create it
    const org = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.id, DEMO_ORG_ID))
      .limit(1);

    if (!org || org.length === 0) {
      await db.insert(orgsTable).values({
        id: DEMO_ORG_ID,
        name: 'Demo Tree Service',
        userId: DEMO_USER_ID,
      });

      // Create default services
      const services = ['Tree Trimming', 'Tree Removal', 'Stump Grinding', 'Pruning', 'Emergency Removal'];
      for (const service of services) {
        await db.insert(servicesTable).values({
          id: generateIdFromEntropySize(16),
          name: service,
          orgId: DEMO_ORG_ID,
        });
      }

      // Create default sources
      const sources = ['Google Ads', 'Facebook Ads', 'Referral', 'Website', 'Direct Call'];
      for (const source of sources) {
        await db.insert(sourcesTable).values({
          id: generateIdFromEntropySize(16),
          name: source,
          orgId: DEMO_ORG_ID,
        });
      }
    }

    // Sample leads to create
    const sampleLeads = [
      {
        service: 'Tree Trimming',
        source: 'Google Ads',
        contactName: 'John Rodriguez',
        estimateStatus: 'PENDING',
        closeStatus: 'OPEN',
      },
      {
        service: 'Tree Removal',
        source: 'Facebook Ads',
        contactName: 'Sarah Johnson',
        estimateStatus: 'SCHEDULED',
        closeStatus: 'OPEN',
      },
      {
        service: 'Stump Grinding',
        source: 'Referral',
        contactName: 'Mike Chen',
        estimateStatus: 'PENDING',
        closeStatus: 'OPEN',
      },
      {
        service: 'Tree Trimming',
        source: 'Website',
        contactName: 'Lisa Martinez',
        estimateStatus: 'COMPLETED',
        closeStatus: 'OPEN',
      },
      {
        service: 'Emergency Removal',
        source: 'Direct Call',
        contactName: 'Tom Wilson',
        estimateStatus: 'PENDING',
        closeStatus: 'OPEN',
      },
      {
        service: 'Pruning',
        source: 'Google Ads',
        contactName: 'Jennifer Lee',
        estimateStatus: 'SCHEDULED',
        closeStatus: 'OPEN',
      },
      {
        service: 'Tree Trimming',
        source: 'Referral',
        contactName: 'David Brown',
        estimateStatus: 'PENDING',
        closeStatus: 'OPEN',
      },
      {
        service: 'Stump Grinding',
        source: 'Facebook Ads',
        contactName: 'Amanda Clark',
        estimateStatus: 'SCHEDULED',
        closeStatus: 'OPEN',
      },
    ];

    // Create leads
    let createdCount = 0;
    for (const leadData of sampleLeads) {
      await db.insert(leadsTable).values({
        id: generateIdFromEntropySize(16),
        orgId: DEMO_ORG_ID,
        ...leadData,
      });
      createdCount++;
    }

    return NextResponse.json({
      message: 'Test data seeded successfully',
      orgId: DEMO_ORG_ID,
      leadsCreated: createdCount,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
