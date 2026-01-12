import { NextResponse, NextRequest } from 'next/server';
import { getDb, orgsTable, leadsTable } from '@/lib/db';
import { eq, count } from 'drizzle-orm';

/**
 * Get all organizations for a user (for agency dashboard)
 * GET /api/orgs/list?userId=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
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

    // Get all orgs for user
    const orgs = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.userId, userId));

    // For each org, get lead count
    const orgsWithStats = await Promise.all(
      orgs.map(async (org: (typeof orgs)[0]) => {
        const leadsCount = await db
          .select({ count: count() })
          .from(leadsTable)
          .where(eq(leadsTable.orgId, org.id));

        // Filter by closeStatus would require reading all leads
        // For now just return total count
        return {
          ...org,
          totalLeads: leadsCount[0]?.count || 0,
        };
      })
    );

    return NextResponse.json({
      userId,
      orgs: orgsWithStats,
    });
  } catch (error) {
    console.error('Orgs list error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch organizations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
