import { NextResponse } from 'next/server';
import { getDb, usersTable, orgsTable, servicesTable, sourcesTable } from '@/lib/db';
import { hashPassword, generateUserId } from '@/lib/auth';
import { generateIdFromEntropySize } from 'lucia';
import { getIndustryTemplate, type Industry } from '@/lib/constants/industries';
import { eq } from 'drizzle-orm';

/**
 * DEVELOPMENT ONLY: Complete demo setup with both agency and business owner
 * POST /api/dev/setup-demo
 */
export async function POST() {
  try {

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const results: {
      agencyCreated: boolean;
      businessOwnersCreated: Array<{
        email: string;
        password: string;
        name: string;
        industry: string;
      }>;
    } = {
      agencyCreated: false,
      businessOwnersCreated: [],
    };

    // Create Agency User
    const agencyEmail = 'agency@example.com';
    const agencyPassword = 'agency123';

    const existingAgency = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, agencyEmail))
      .limit(1);

    if (existingAgency.length === 0) {
      const agencyUserId = generateUserId();
      const hashedPassword = await hashPassword(agencyPassword);

      await db.insert(usersTable).values({
        id: agencyUserId,
        email: agencyEmail,
        password: hashedPassword,
        name: 'Demo Agency',
        userType: 'agency',
        industry: 'general',
      });

      // Create 3 client orgs for agency
      const clients = [
        { name: 'Tree Service Co', industry: 'tree_service' as Industry },
        { name: 'HVAC Solutions', industry: 'hvac' as Industry },
        { name: 'Plumbing Pro', industry: 'plumbing' as Industry },
      ];

      for (const client of clients) {
        const orgId = generateIdFromEntropySize(16);
        const template = getIndustryTemplate(client.industry);

        await db.insert(orgsTable).values({
          id: orgId,
          name: client.name,
          userId: agencyUserId,
        });

        for (const serviceName of template.services) {
          await db.insert(servicesTable).values({
            id: generateIdFromEntropySize(16),
            name: serviceName,
            orgId,
          });
        }

        for (const sourceName of template.sources) {
          await db.insert(sourcesTable).values({
            id: generateIdFromEntropySize(16),
            name: sourceName,
            orgId,
          });
        }
      }

      results.agencyCreated = true;
    }

    // Create Sample Business Owners
    const businessOwners = [
      { email: 'hvac@example.com', name: 'John HVAC', industry: 'hvac' as Industry },
      { email: 'plumbing@example.com', name: 'Jane Plumbing', industry: 'plumbing' as Industry },
      { email: 'roofing@example.com', name: 'Bob Roofing', industry: 'roofing' as Industry },
      { email: 'treeservice@example.com', name: 'Tom Tree Service', industry: 'tree_service' as Industry },
    ];

    for (const owner of businessOwners) {
      const existing = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, owner.email))
        .limit(1);

      if (existing.length === 0) {
        const userId = generateUserId();
        const hashedPassword = await hashPassword('password123');
        const template = getIndustryTemplate(owner.industry);

        await db.insert(usersTable).values({
          id: userId,
          email: owner.email,
          password: hashedPassword,
          name: owner.name,
          userType: 'business_owner',
          industry: owner.industry,
        });

        // Create their org
        const orgId = generateIdFromEntropySize(16);
        await db.insert(orgsTable).values({
          id: orgId,
          name: `${owner.name}'s Business`,
          userId,
        });

        // Add services
        for (const serviceName of template.services) {
          await db.insert(servicesTable).values({
            id: generateIdFromEntropySize(16),
            name: serviceName,
            orgId,
          });
        }

        // Add sources
        for (const sourceName of template.sources) {
          await db.insert(sourcesTable).values({
            id: generateIdFromEntropySize(16),
            name: sourceName,
            orgId,
          });
        }

        results.businessOwnersCreated.push({
          email: owner.email,
          password: 'password123',
          name: owner.name,
          industry: owner.industry as string,
        });
      }
    }

    return NextResponse.json({
      message: 'Demo setup complete',
      agency: {
        email: agencyEmail,
        password: agencyPassword,
        type: 'AGENCY - See all clients',
        created: results.agencyCreated,
      },
      businessOwners: results.businessOwnersCreated.length > 0
        ? results.businessOwnersCreated
        : 'All business owners already exist',
    });
  } catch (error) {
    console.error('Setup demo error:', error);
    return NextResponse.json(
      {
        error: 'Setup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
