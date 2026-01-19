import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, leadsTable, orgsTable } from '@/lib/db';
import { generateIdFromEntropySize } from 'lucia';
import { eq } from 'drizzle-orm';
import { serializeLeadTags } from '@/lib/tags';

const createLeadSchema = z.object({
  orgId: z.string().min(1),
  service: z.string().min(1),
  source: z.string().min(1),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  estimateAmount: z.number().positive().optional(),
  estimateStatus: z.enum(['PENDING', 'SCHEDULED', 'COMPLETED', 'NO_SHOW']).default('PENDING'),
  closeStatus: z.enum(['OPEN', 'WON', 'LOST']).default('OPEN'),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLeadSchema.parse(body);
    const { orgId, service, source, contactName, email, phone, estimateAmount, estimateStatus, closeStatus, notes } = validatedData;

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

    // Build tags array from org's companyTag
    const tags: string[] = [];
    if (org[0].companyTag) {
      tags.push(org[0].companyTag);
    }

    // Create lead
    const leadId = generateIdFromEntropySize(16);
    const now = new Date();
    const newLead = await db
      .insert(leadsTable)
      .values({
        id: leadId,
        orgId,
        service,
        source,
        contactName,
        email,
        phone,
        estimateAmount,
        notes,
        estimateStatus,
        closeStatus,
        tags: serializeLeadTags(tags),
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!newLead || newLead.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // Send to webhook if configured
    if (org[0].webhookUrl) {
      try {
        await fetch(org[0].webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: newLead[0].id,
            orgId,
            service,
            source,
            contactName,
            email,
            phone,
            estimateAmount,
            estimateStatus,
            closeStatus,
            notes,
            tags: newLead[0].tags ? JSON.parse(newLead[0].tags) : [],
            createdAt: newLead[0].createdAt,
          }),
        });
      } catch (webhookError) {
        console.error('Webhook send error:', webhookError);
        // Don't fail the lead creation if webhook fails
      }
    }

    // Sync to GoHighLevel (AC Guys)
    try {
      const { GHLClient, AC_GUYS_FIELDS } = await import('@/lib/ghl-client');
      const ghlClient = new GHLClient();

      // Build custom fields for AC Guys
      const customFields: Array<{ id: string; value: string }> = [];

      if (service) {
        customFields.push({ id: AC_GUYS_FIELDS.service, value: service });
      }
      if (source) {
        customFields.push({ id: AC_GUYS_FIELDS.source, value: source });
      }
      if (estimateAmount) {
        customFields.push({ id: AC_GUYS_FIELDS.estimateAmount, value: estimateAmount.toString() });
      }
      if (estimateStatus) {
        customFields.push({ id: AC_GUYS_FIELDS.estimateStatus, value: estimateStatus });
      }
      if (closeStatus) {
        customFields.push({ id: AC_GUYS_FIELDS.closeStatus, value: closeStatus });
      }

      const ghlContactData = {
        firstName: contactName?.split(' ')[0],
        lastName: contactName?.split(' ').slice(1).join(' ') || undefined,
        email: email || undefined,
        phone: phone || undefined,
        tags: newLead[0].tags ? JSON.parse(newLead[0].tags) : [],
        customFields: customFields.length > 0 ? customFields : undefined,
      };

      // Use lead ID as identifier for placeholder email if no email provided
      const result = await ghlClient.upsertContact(ghlContactData, leadId);
      console.log(`✅ GHL sync: ${result.action} contact ${result.contact.id}`);
    } catch (ghlError) {
      console.error('❌ GHL sync error:', ghlError);
      // Don't fail the lead creation if GHL sync fails
    }

    // Sync to Google Sheets
    try {
      const { SheetsClient } = await import('@/lib/sheets-client');
      const sheetsClient = new SheetsClient();

      const companyTag = org[0].companyTag || 'untagged';

      await sheetsClient.appendLead(companyTag, {
        contactName: contactName || 'N/A',
        email: email || '',
        phone: phone || '',
        service,
        source,
        estimateAmount: estimateAmount || null,
        estimateStatus,
        closeStatus,
        revenue: null,
        notes: notes || '',
        tags: newLead[0].tags ? JSON.parse(newLead[0].tags) : [],
        createdAt: newLead[0].createdAt as Date,
        companyTag,
      });

      console.log(`✅ Sheets sync: appended lead to tab "${companyTag}"`);
    } catch (sheetsError) {
      console.error('❌ Sheets sync error:', sheetsError);
      // Don't fail the lead creation if Sheets sync fails
    }

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
