import { NextRequest, NextResponse } from 'next/server';
import { getDb, leadsTable, orgsTable, servicesTable, sourcesTable } from '@/lib/db';
import { generateIdFromEntropySize } from 'lucia';
import { eq } from 'drizzle-orm';

/**
 * DEVELOPMENT ONLY: Seed test data for an org
 * POST /api/dev/seed-leads?orgId=... (optional, defaults to first org)
 */
export async function POST(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const requestedOrgId = searchParams.get('orgId');

    let DEMO_ORG_ID: string;

    if (requestedOrgId) {
      // Use provided org ID
      const org = await db
        .select()
        .from(orgsTable)
        .where(eq(orgsTable.id, requestedOrgId))
        .limit(1);

      if (!org || org.length === 0) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      DEMO_ORG_ID = org[0].id;
    } else {
      // Get first org
      const orgs = await db
        .select()
        .from(orgsTable)
        .limit(1);

      if (!orgs || orgs.length === 0) {
        return NextResponse.json(
          { error: 'No organizations found. Run /api/dev/setup-demo first.' },
          { status: 400 }
        );
      }
      DEMO_ORG_ID = orgs[0].id;
    }

    // Fetch org's services and sources
    const orgServices = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.orgId, DEMO_ORG_ID));

    const orgSources = await db
      .select()
      .from(sourcesTable)
      .where(eq(sourcesTable.orgId, DEMO_ORG_ID));

    if (!orgServices || orgServices.length === 0 || !orgSources || orgSources.length === 0) {
      return NextResponse.json(
        { error: 'Organization has no services or sources configured' },
        { status: 400 }
      );
    }

    // Sample names for diversity (20 leads)
    const names = [
      'John Rodriguez', 'Sarah Johnson', 'Mike Chen', 'Lisa Martinez',
      'Tom Wilson', 'Jennifer Lee', 'David Brown', 'Amanda Clark',
      'Ryan Martinez', 'Emily White', 'Chris Johnson', 'Sofia Garcia',
      'James Taylor', 'Michelle Brown', 'Daniel Lee', 'Jessica Anderson',
      'Kevin Smith', 'Rachel Davis', 'Brandon Wilson', 'Lauren Taylor',
    ];

    // Generate varied leads with different statuses and amounts
    const sampleLeads = names.map((name, index) => {
      const estimateStatus = ['PENDING', 'SCHEDULED', 'COMPLETED', 'NO_SHOW'][index % 4];
      // Can only be WON/LOST if COMPLETED or NO_SHOW
      const canBeWon = estimateStatus === 'COMPLETED' || estimateStatus === 'NO_SHOW';
      const closeStatus = canBeWon ? ['OPEN', 'WON', 'LOST'][index % 3] : 'OPEN';

      return {
        service: orgServices[index % orgServices.length].name,
        source: orgSources[index % orgSources.length].name,
        contactName: name,
        estimateStatus,
        closeStatus,
        estimateAmount: closeStatus === 'WON' ? Math.floor(Math.random() * 8000) + 1000 : null,
      };
    });

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
