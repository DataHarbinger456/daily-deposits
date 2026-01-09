import { NextRequest, NextResponse } from 'next/server';
import { getDb, orgsTable, servicesTable, sourcesTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

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

    // Get org
    const org = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.id, orgId))
      .limit(1);

    if (!org || org.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (org[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get services
    const services = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.orgId, orgId));

    // Get sources
    const sources = await db
      .select()
      .from(sourcesTable)
      .where(eq(sourcesTable.orgId, orgId));

    return NextResponse.json({
      org: org[0],
      services: services.map((s: { name: string }) => s.name),
      sources: sources.map((s: { name: string }) => s.name),
    });
  } catch (error) {
    console.error('Org fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
