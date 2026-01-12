import { NextRequest, NextResponse } from 'next/server';
import { getDb, leadsTable, orgsTable, Lead } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('orgId');
    const userId = request.headers.get('x-user-id');
    const closeStatusFilter = request.nextUrl.searchParams.get('closeStatus');

    if (!orgId || !userId) {
      return NextResponse.json(
        { error: 'Missing orgId or userId' },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Verify org ownership
    const org = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.id, orgId))
      .limit(1);

    if (!org || org.length === 0 || org[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get leads with optional status filter
    let leads;
    const isValidStatus = (status: string): status is 'OPEN' | 'WON' | 'LOST' => {
      return ['OPEN', 'WON', 'LOST'].includes(status);
    };

    if (closeStatusFilter && closeStatusFilter !== 'ALL' && isValidStatus(closeStatusFilter)) {
      leads = await db
        .select()
        .from(leadsTable)
        .where(
          and(
            eq(leadsTable.orgId, orgId),
            eq(leadsTable.closeStatus, closeStatusFilter)
          )
        );
    } else {
      // Get all leads for this org
      leads = await db
        .select()
        .from(leadsTable)
        .where(eq(leadsTable.orgId, orgId));
    }

    // Sort by most recent first
    leads.sort(
      (a: Lead, b: Lead) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Leads fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
