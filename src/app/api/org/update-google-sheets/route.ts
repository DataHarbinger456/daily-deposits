import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, orgsTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

const updateGoogleSheetsSchema = z.object({
  orgId: z.string().min(1),
  googleSheetsSpreadsheetId: z.string().min(1),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateGoogleSheetsSchema.parse(body);
    const { orgId, googleSheetsSpreadsheetId } = validatedData;

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

    // Update Google Sheets Spreadsheet ID
    const updatedOrg = await db
      .update(orgsTable)
      .set({ googleSheetsSpreadsheetId })
      .where(eq(orgsTable.id, orgId))
      .returning();

    return NextResponse.json({
      message: 'Google Sheets ID saved successfully',
      org: updatedOrg[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update Google Sheets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
