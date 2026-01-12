import { NextRequest, NextResponse } from 'next/server';
import { getDb, leadsTable, orgsTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * Get dashboard metrics for an organization
 * GET /api/dashboard/metrics?orgId=...&userId=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');
    const userId = searchParams.get('userId');

    if (!orgId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: orgId, userId' },
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

    // Get all leads for this org
    const leads = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.orgId, orgId));

    // Calculate metrics
    const wonLeads = leads.filter((l: typeof leads[0]) => l.closeStatus === 'WON');
    const openLeads = leads.filter((l: typeof leads[0]) => l.closeStatus === 'OPEN');
    const totalLeads = leads.length;

    // Revenue by source (only WON leads with estimateAmount)
    const revenueBySource: Record<string, { revenue: number; count: number }> = {};
    wonLeads.forEach((lead: typeof leads[0]) => {
      if (!revenueBySource[lead.source]) {
        revenueBySource[lead.source] = { revenue: 0, count: 0 };
      }
      revenueBySource[lead.source].revenue += lead.estimateAmount || 0;
      revenueBySource[lead.source].count += 1;
    });

    // Lead volume by source (all leads)
    const volumeBySource: Record<string, number> = {};
    leads.forEach((lead: typeof leads[0]) => {
      volumeBySource[lead.source] = (volumeBySource[lead.source] || 0) + 1;
    });

    // Close rate by source
    const closeRateBySource: Record<string, { rate: number; won: number; total: number }> = {};
    Object.keys(volumeBySource).forEach((source: string) => {
      const sourceLeads = leads.filter((l: typeof leads[0]) => l.source === source);
      const sourceWonLeads = wonLeads.filter((l: typeof leads[0]) => l.source === source);
      closeRateBySource[source] = {
        rate: sourceLeads.length > 0 ? (sourceWonLeads.length / sourceLeads.length) * 100 : 0,
        won: sourceWonLeads.length,
        total: sourceLeads.length,
      };
    });

    // Total revenue
    const totalRevenue = wonLeads.reduce((sum: number, lead: typeof leads[0]) => sum + (lead.estimateAmount || 0), 0);

    // Win rate
    const winRate = totalLeads > 0 ? (wonLeads.length / totalLeads) * 100 : 0;

    // Average deal size
    const averageDealSize = wonLeads.length > 0 ? totalRevenue / wonLeads.length : 0;

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalLeads,
        wonLeads: wonLeads.length,
        openLeads: openLeads.length,
        winRate: Math.round(winRate * 100) / 100,
        averageDealSize: Math.round(averageDealSize * 100) / 100,
      },
      revenueBySource,
      volumeBySource,
      closeRateBySource,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
