import { NextResponse, NextRequest } from 'next/server';
import { getDb, sourcesTable, orgsTable } from '@/lib/db';
import { generateIdFromEntropySize } from 'lucia';
import { eq } from 'drizzle-orm';

/**
 * Create a new lead source for an organization
 * POST /api/sources/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, sourceName, userId } = body as {
      orgId: string;
      sourceName: string;
      userId: string;
    };

    if (!orgId || !sourceName || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: orgId, sourceName, userId' },
        { status: 400 }
      );
    }

    if (sourceName.trim().length === 0) {
      return NextResponse.json({ error: 'Source name cannot be empty' }, { status: 400 });
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

    // Create source
    const newSource = {
      id: generateIdFromEntropySize(16),
      name: sourceName.trim(),
      orgId,
    };

    await db.insert(sourcesTable).values(newSource);

    return NextResponse.json(newSource, { status: 201 });
  } catch (error) {
    console.error('Source creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create source',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
