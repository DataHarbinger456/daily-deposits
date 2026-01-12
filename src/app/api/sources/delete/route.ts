import { NextResponse, NextRequest } from 'next/server';
import { getDb, sourcesTable, orgsTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * Delete a lead source from an organization
 * DELETE /api/sources/delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, orgId, userId } = body as {
      sourceId: string;
      orgId: string;
      userId: string;
    };

    if (!sourceId || !orgId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceId, orgId, userId' },
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

    // Delete source
    await db
      .delete(sourcesTable)
      .where(eq(sourcesTable.id, sourceId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Source deletion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete source',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
