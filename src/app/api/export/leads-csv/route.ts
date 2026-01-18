import { NextRequest, NextResponse } from 'next/server';
import { getDb, leadsTable, orgsTable, Lead } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { convertLeadsToCSV } from '@/lib/csv-export';

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('orgId');
    const userId = request.headers.get('x-user-id');

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
      .where(eq(orgsTable.id, orgId));

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

    // Convert to CSV
    const csv = convertLeadsToCSV(
      leads.map((lead: Lead) => ({
        ...lead,
        companyTag: org[0].companyTag || '',
      }))
    );

    // Return as downloadable CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
