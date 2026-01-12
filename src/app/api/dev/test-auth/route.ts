import { NextResponse, NextRequest } from 'next/server';
import { getDb, usersTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * DEVELOPMENT ONLY: Test endpoint to check auth status
 * GET /api/dev/test-auth?email=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Missing email parameter' },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (users.length === 0) {
      return NextResponse.json({
        found: false,
        message: `No user found with email: ${email}`,
      });
    }

    const user = users[0];
    return NextResponse.json({
      found: true,
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      industry: user.industry,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
