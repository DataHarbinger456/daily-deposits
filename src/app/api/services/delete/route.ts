import { NextResponse, NextRequest } from 'next/server';
import { getDb, servicesTable, orgsTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * Delete a service from an organization
 * DELETE /api/services/delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, orgId, userId } = body as {
      serviceId: string;
      orgId: string;
      userId: string;
    };

    if (!serviceId || !orgId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, orgId, userId' },
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

    // Verify org exists and belongs to user
    const org = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.id, orgId))
      .limit(1);

    if (!org || org.length === 0 || org[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Organization not found or unauthorized' },
        { status: 403 }
      );
    }

    // Delete service
    await db
      .delete(servicesTable)
      .where(eq(servicesTable.id, serviceId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Service deletion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete service',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
