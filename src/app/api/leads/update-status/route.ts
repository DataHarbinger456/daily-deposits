import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, leadsTable, orgsTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

const updateStatusSchema = z.object({
  leadId: z.string().min(1),
  closeStatus: z.enum(['OPEN', 'WON', 'LOST']).optional(),
  estimateStatus: z
    .enum(['PENDING', 'SCHEDULED', 'COMPLETED', 'NO_SHOW'])
    .optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);
    const { leadId, closeStatus, estimateStatus } = validatedData;

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

    // Get lead and verify org ownership
    const leads = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.id, leadId))
      .limit(1);

    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const lead = leads[0];

    // Verify ownership via org
    const org = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.id, lead.orgId))
      .limit(1);

    if (!org || org.length === 0 || org[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update lead
    const updateData: Record<string, unknown> = {};
    if (closeStatus) updateData.closeStatus = closeStatus;
    if (estimateStatus) updateData.estimateStatus = estimateStatus;

    const updatedLead = await db
      .update(leadsTable)
      .set(updateData)
      .where(eq(leadsTable.id, leadId))
      .returning();

    return NextResponse.json({
      message: 'Lead updated successfully',
      lead: updatedLead[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Lead update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
