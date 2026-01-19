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

    // Validation: closeStatus can only be WON/LOST if estimateStatus is COMPLETED or NO_SHOW
    const newEstimateStatus = estimateStatus || lead.estimateStatus;
    const newCloseStatus = closeStatus || lead.closeStatus;

    if (
      (newCloseStatus === 'WON' || newCloseStatus === 'LOST') &&
      (newEstimateStatus === 'PENDING' || newEstimateStatus === 'SCHEDULED')
    ) {
      return NextResponse.json(
        { error: 'Cannot mark as won/lost until estimate is completed or no-showed' },
        { status: 400 }
      );
    }

    // Update lead
    const updateData: Record<string, unknown> = {};
    if (closeStatus) updateData.closeStatus = closeStatus;
    if (estimateStatus) updateData.estimateStatus = estimateStatus;
    updateData.updatedAt = new Date();

    const updatedLead = await db
      .update(leadsTable)
      .set(updateData)
      .where(eq(leadsTable.id, leadId))
      .returning();

    // Sync to Google Sheets
    if (updatedLead && updatedLead.length > 0) {
      try {
        const { SheetsClient } = await import('@/lib/sheets-client');
        const sheetsClient = new SheetsClient();

        const companyTag = org[0].companyTag || 'untagged';

        await sheetsClient.updateLead(companyTag, {
          id: updatedLead[0].id,
          contactName: updatedLead[0].contactName || 'N/A',
          email: updatedLead[0].email || '',
          phone: updatedLead[0].phone || '',
          service: updatedLead[0].service,
          source: updatedLead[0].source,
          estimateAmount: updatedLead[0].estimateAmount,
          estimateStatus: updatedLead[0].estimateStatus,
          closeStatus: updatedLead[0].closeStatus,
          revenue: updatedLead[0].revenue,
          notes: updatedLead[0].notes || '',
          tags: updatedLead[0].tags ? JSON.parse(updatedLead[0].tags) : [],
          createdAt: updatedLead[0].createdAt as Date,
          updatedAt: updatedLead[0].updatedAt as Date,
          companyTag,
        });

        console.log(`✅ Sheets sync: updated lead ${leadId} status in tab "${companyTag}"`);
      } catch (sheetsError) {
        console.error('❌ Sheets sync error:', sheetsError);
        // Don't fail the lead status update if Sheets sync fails
      }
    }

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
