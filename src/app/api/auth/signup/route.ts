import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, usersTable, orgsTable, servicesTable, sourcesTable } from '@/lib/db';
import { hashPassword, generateUserId } from '@/lib/auth';
import { generateIdFromEntropySize } from 'lucia';
import { getIndustryTemplate, type Industry } from '@/lib/constants/industries';
import { eq } from 'drizzle-orm';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = signupSchema.parse(body);
    const { email, password, name, companyName, industry = 'general' } = validatedData;

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = generateUserId();
    const newUser = await db
      .insert(usersTable)
      .values({
        id: userId,
        email,
        password: hashedPassword,
        name,
        companyName,
        userType: 'business_owner',
        industry,
      })
      .returning();

    // Create default organization for the user
    const orgId = generateIdFromEntropySize(16);
    const orgName = companyName;
    // Auto-generate company tag from organization name (lowercase, replace spaces with hyphens)
    const companyTag = orgName.toLowerCase().replace(/\s+/g, '-');

    await db.insert(orgsTable).values({
      id: orgId,
      name: orgName,
      userId: newUser[0].id,
      companyTag,
    });

    // Get industry template and create services/sources
    const industryTemplate = getIndustryTemplate(industry as Industry);

    // Create services from industry template
    for (const serviceName of industryTemplate.services) {
      await db.insert(servicesTable).values({
        id: generateIdFromEntropySize(16),
        name: serviceName,
        orgId,
      });
    }

    // Create sources from industry template
    for (const sourceName of industryTemplate.sources) {
      await db.insert(sourcesTable).values({
        id: generateIdFromEntropySize(16),
        name: sourceName,
        orgId,
      });
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
          industry: newUser[0].industry,
        },
        org: {
          id: orgId,
          name: orgName,
          servicesCount: industryTemplate.services.length,
          sourcesCount: industryTemplate.sources.length,
        },
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

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
