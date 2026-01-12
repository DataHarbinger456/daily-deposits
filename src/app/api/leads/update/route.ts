import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, leadsTable, orgsTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

const updateLeadSchema = z.object({
  leadId: z.string().min(1),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  service: z.string().optional(),
  source: z.string().optional(),
  estimateAmount: z.number().positive().optional(),
  estimateStatus: z.enum(['PENDING', 'SCHEDULED', 'COMPLETED', 'NO_SHOW']).optional(),
  closeStatus: z.enum(['OPEN', 'WON', 'LOST']).optional(),
  notes: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateLeadSchema.parse(body);
    const { leadId, ...updateFields } = validatedData;

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

    // Validation: closeStatus can only be WON/LOST if estimateStatus is COMPLETED or NO_SHOW
    const newEstimateStatus = updateFields.estimateStatus || lead.estimateStatus;
    const newCloseStatus = updateFields.closeStatus || lead.closeStatus;

    if (
      (newCloseStatus === 'WON' || newCloseStatus === 'LOST') &&
      (newEstimateStatus === 'PENDING' || newEstimateStatus === 'SCHEDULED')
    ) {
      return NextResponse.json(
        { error: 'Cannot mark as won/lost until estimate is completed or no-showed' },
        { status: 400 }
      );
    }

    // Update lead with only provided fields
    const updateData: Record<string, unknown> = {};
    if (updateFields.contactName !== undefined) updateData.contactName = updateFields.contactName;
    if (updateFields.email !== undefined) updateData.email = updateFields.email;
    if (updateFields.phone !== undefined) updateData.phone = updateFields.phone;
    if (updateFields.service !== undefined) updateData.service = updateFields.service;
    if (updateFields.source !== undefined) updateData.source = updateFields.source;
    if (updateFields.estimateAmount !== undefined) updateData.estimateAmount = updateFields.estimateAmount;
    if (updateFields.estimateStatus !== undefined) updateData.estimateStatus = updateFields.estimateStatus;
    if (updateFields.closeStatus !== undefined) updateData.closeStatus = updateFields.closeStatus;
    if (updateFields.notes !== undefined) updateData.notes = updateFields.notes;

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
