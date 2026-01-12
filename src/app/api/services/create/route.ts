import { NextResponse, NextRequest } from 'next/server';
import { getDb, servicesTable, orgsTable } from '@/lib/db';
import { generateIdFromEntropySize } from 'lucia';
import { eq } from 'drizzle-orm';

/**
 * Create a new service for an organization
 * POST /api/services/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, serviceName, userId } = body as {
      orgId: string;
      serviceName: string;
      userId: string;
    };

    if (!orgId || !serviceName || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: orgId, serviceName, userId' },
        { status: 400 }
      );
    }

    if (serviceName.trim().length === 0) {
      return NextResponse.json({ error: 'Service name cannot be empty' }, { status: 400 });
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

    // Create service
    const newService = {
      id: generateIdFromEntropySize(16),
      name: serviceName.trim(),
      orgId,
    };

    await db.insert(servicesTable).values(newService);

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create service',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
