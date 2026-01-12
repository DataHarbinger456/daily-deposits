import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, orgsTable, servicesTable, sourcesTable } from '@/lib/db';
import { generateIdFromEntropySize } from 'lucia';

const createOrgSchema = z.object({
  name: z.string().min(1, 'Org name is required'),
  services: z.array(z.string().min(1)).optional(),
  sources: z.array(z.string().min(1)).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createOrgSchema.parse(body);
    const {
      name,
      services = ['Service 1', 'Service 2'],
      sources = ['Direct', 'Referral'],
    } = validatedData;

    // TODO: Get user from session
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Create org
    const orgId = generateIdFromEntropySize(16);
    await db.insert(orgsTable).values({
      id: orgId,
      name,
      userId,
    });

    // Create services
    for (const serviceName of services) {
      await db.insert(servicesTable).values({
        id: generateIdFromEntropySize(16),
        name: serviceName,
        orgId,
      });
    }

    // Create sources
    for (const sourceName of sources) {
      await db.insert(sourcesTable).values({
        id: generateIdFromEntropySize(16),
        name: sourceName,
        orgId,
      });
    }

    return NextResponse.json(
      {
        message: 'Organization created successfully',
        orgId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Org creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
