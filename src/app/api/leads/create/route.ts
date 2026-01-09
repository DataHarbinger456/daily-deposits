import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, leadsTable, orgsTable } from '@/lib/db';
import { generateIdFromEntropySize } from 'lucia';
import { eq } from 'drizzle-orm';

const createLeadSchema = z.object({
  orgId: z.string().min(1),
  service: z.string().min(1),
  source: z.string().min(1),
  contactName: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLeadSchema.parse(body);
    const { orgId, service, source, contactName, notes } = validatedData;

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

    // Create lead
    const leadId = generateIdFromEntropySize(16);
    const newLead = await db
      .insert(leadsTable)
      .values({
        id: leadId,
        orgId,
        service,
        source,
        contactName,
        notes,
        estimateStatus: 'PENDING',
        closeStatus: 'OPEN',
      })
      .returning();

    return NextResponse.json(
      {
        message: 'Lead created successfully',
        lead: newLead[0],
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

    console.error('Lead creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
