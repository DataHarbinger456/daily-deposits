import { NextResponse } from 'next/server';
import { getDb, usersTable, orgsTable, servicesTable, sourcesTable } from '@/lib/db';
import { hashPassword, generateUserId } from '@/lib/auth';
import { generateIdFromEntropySize } from 'lucia';
import { getIndustryTemplate, type Industry } from '@/lib/constants/industries';
import { eq } from 'drizzle-orm';

/**
 * DEVELOPMENT ONLY: Create a demo agency user with test client accounts
 * POST /api/dev/create-agency-user
 */
export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Only available in development' },
        { status: 403 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const agencyEmail = 'agency@example.com';
    const agencyPassword = 'agency123';

    // Check if agency user already exists
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, agencyEmail))
      .limit(1);

    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          message: 'Agency user already exists',
          credentials: {
            email: agencyEmail,
            password: agencyPassword,
          },
        },
        { status: 200 }
      );
    }

    // Create agency user
    const userId = generateUserId();
    const hashedPassword = await hashPassword(agencyPassword);

    await db.insert(usersTable).values({
      id: userId,
      email: agencyEmail,
      password: hashedPassword,
      name: 'Demo Agency',
      userType: 'agency',
      industry: 'general',
    });

    // Create 3 sample client accounts for the agency
    const clientNames = ['Tree Service Co', 'HVAC Solutions', 'Plumbing Pro'];
    const industries: Industry[] = ['tree_service', 'hvac', 'plumbing'];

    for (let i = 0; i < clientNames.length; i++) {
      const orgId = generateIdFromEntropySize(16);
      const industry = industries[i];
      const template = getIndustryTemplate(industry);

      // Create org
      await db.insert(orgsTable).values({
        id: orgId,
        name: clientNames[i],
        userId,
      });

      // Create services
      for (const serviceName of template.services.slice(0, 5)) {
        await db.insert(servicesTable).values({
          id: generateIdFromEntropySize(16),
          name: serviceName,
          orgId,
        });
      }

      // Create sources
      for (const sourceName of template.sources.slice(0, 4)) {
        await db.insert(sourcesTable).values({
          id: generateIdFromEntropySize(16),
          name: sourceName,
          orgId,
        });
      }
    }

    return NextResponse.json(
      {
        message: 'Agency user created successfully',
        credentials: {
          email: agencyEmail,
          password: agencyPassword,
          type: 'agency',
        },
        clientAccounts: clientNames,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create agency user error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create agency user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
