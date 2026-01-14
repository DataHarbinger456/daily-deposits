import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, orgsTable } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { normalizeCompanyTag } from '@/lib/tags';

const updateCompanyTagSchema = z.object({
  orgId: z.string().min(1, 'Organization ID is required'),
  companyTag: z
    .string()
    .optional()
    .transform((val) => {
      return val ? normalizeCompanyTag(val) : undefined;
    }),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateCompanyTagSchema.parse(body);
    const { orgId, companyTag } = validatedData;

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

    // Verify org ownership
    const orgs = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.id, orgId))
      .limit(1);

    if (!orgs || orgs.length === 0 || orgs[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update company tag
    const updated = await db
      .update(orgsTable)
      .set({
        companyTag: companyTag || null,
        updatedAt: new Date(),
      })
      .where(eq(orgsTable.id, orgId))
      .returning();

    return NextResponse.json({
      message: 'Company tag updated successfully',
      org: updated[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Company tag update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
