import { NextResponse, NextRequest } from 'next/server';
import { getDb, usersTable, orgsTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * Get current user and their accessible organizations
 * GET /api/user/current?userId=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const viewingOrgId = searchParams.get('viewingOrgId'); // Optional: which org they're currently viewing

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
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

    // Get user
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Get all orgs this user owns (works for both business_owner and agency)
    const orgs = await db
      .select()
      .from(orgsTable)
      .where(eq(orgsTable.userId, userId));

    // Determine current org to view
    type Org = (typeof orgs)[0];
    let currentOrg: Org | null = null;
    if (viewingOrgId) {
      // Verify user has access to this org
      const requestedOrg = orgs.find((o: Org) => o.id === viewingOrgId);
      if (requestedOrg) {
        currentOrg = requestedOrg;
      }
    } else if (orgs.length > 0) {
      // Default to first org
      currentOrg = orgs[0];
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        userType: user.userType,
        industry: user.industry,
      },
      currentOrg,
      accessibleOrgs: orgs,
      isAgency: user.userType === 'agency',
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
