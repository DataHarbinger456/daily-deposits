import { NextResponse, NextRequest } from 'next/server';
import { getDb, orgsTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * Delete an organization
 * DELETE /api/org/delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, userId } = body as { orgId: string; userId: string };

    if (!orgId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: orgId, userId' },
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

    // Delete organization (cascades to related records)
    await db.delete(orgsTable).where(eq(orgsTable.id, orgId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Org deletion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete organization',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
