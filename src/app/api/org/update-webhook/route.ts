import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, orgsTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

const updateWebhookSchema = z.object({
  orgId: z.string().min(1),
  webhookUrl: z.string().url().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateWebhookSchema.parse(body);
    const { orgId, webhookUrl } = validatedData;

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
    const orgs = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.id, orgId));

    if (!orgs || orgs.length === 0 || orgs[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update webhook URL
    const updated = await db
      .update(orgsTable)
      .set({ webhookUrl })
      .where(eq(orgsTable.id, orgId))
      .returning();

    return NextResponse.json({
      message: 'Webhook URL updated successfully',
      org: updated[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Webhook update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
