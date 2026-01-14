import { NextRequest, NextResponse } from 'next/server';
import { getDb, usersTable, orgsTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * GET /api/me - Get current authenticated user info
 * Reads userId from httpOnly cookie and returns user data
 */
export async function GET(request: NextRequest) {
  try {
    // Extract userId from httpOnly cookie
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
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

    // Get user data
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Get user's organizations
    const orgs = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.userId, userId));

    // Get viewing org from query param if specified
    const viewingOrgId = request.nextUrl.searchParams.get('viewingOrgId');
    let currentOrg = null;

    if (viewingOrgId) {
      // Agency viewing a specific sub-account
      const subOrgs = orgs.filter((o: typeof orgs[0]) => o.id === viewingOrgId);
      if (subOrgs.length > 0) {
        currentOrg = subOrgs[0];
      }
    } else {
      // Regular user or agency without specific viewing org
      currentOrg = orgs.length > 0 ? orgs[0] : null;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        industry: user.industry,
      },
      isAgency: user.userType === 'agency',
      orgs,
      currentOrg,
    });
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
