import { NextRequest, NextResponse } from 'next/server';
import { getDb, leadsTable } from '@/lib/db';
import { GHLClient } from '@/lib/ghl-client';
import { parseLeadTags } from '@/lib/tags';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json();

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Fetch lead
    const leads = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.id, leadId));

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const lead = leads[0];

    // Sync to GHL
    const ghlClient = new GHLClient();
    const ghlContactData = {
      firstName: lead.contactName?.split(' ')[0],
      lastName: lead.contactName?.split(' ').slice(1).join(' ') || undefined,
      email: lead.email || undefined,
      phone: lead.phone || undefined,
      tags: parseLeadTags(lead.tags),
    };

    // Use lead ID as identifier for placeholder email if no email provided
    const result = await ghlClient.upsertContact(ghlContactData, lead.id);

    return NextResponse.json({
      message: `Contact ${result.action} in GHL`,
      ghlContactId: result.contact.id,
      action: result.action,
    });
  } catch (error) {
    console.error('Manual GHL sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync to GHL' },
      { status: 500 }
    );
  }
}
