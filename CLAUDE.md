# Daily Deposits

Track your daily deposits with a simple, powerful, and intuitive interface. Multi-tenant SaaS application for recording and analyzing deposit trends.

## Project Structure

```
src/
  ├── app/
  │   ├── page.tsx               # Landing page (public)
  │   ├── login/
  │   │   └── page.tsx           # Login page
  │   ├── signup/
  │   │   └── page.tsx           # Signup page
  │   ├── dashboard/
  │   │   ├── layout.tsx         # Dashboard layout with sidebar
  │   │   ├── page.tsx           # Dashboard home
  │   │   └── [other routes]     # Future dashboard pages
  │   ├── api/
  │   │   └── auth/
  │   │       └── signup/        # User registration endpoint
  │   ├── globals.css            # Global styles + Tailwind CSS
  │   └── layout.tsx             # Root layout
  ├── components/
  │   ├── auth/
  │   │   ├── LoginForm.tsx      # Login form component
  │   │   └── SignupForm.tsx     # Signup form component
  │   ├── layout/
  │   │   └── Sidebar.tsx        # Dashboard sidebar navigation
  │   └── ui/                    # shadcn/ui components
  ├── lib/
  │   ├── db/
  │   │   ├── index.ts           # Database client setup
  │   │   └── schema.ts          # Drizzle ORM schema (SQLite/PostgreSQL)
  │   ├── auth.ts                # Authentication helpers
  │   └── utils.ts               # Utility functions
  └── types/                     # TypeScript type definitions

public/                           # Static assets
```

## Organization Rules

**Code Structure:**
- API routes → `/app/api`, one file per endpoint
- Components → `/components`, grouped by feature (auth, layout, ui)
- Database → `/lib/db`, schema and queries
- Utilities → `/lib`, shared functions and configurations
- Types → Inline with features or in `/types`

**Modularity Principles:**
- Single responsibility per file
- Clear, descriptive names
- Group related functionality together
- Max 300 lines per file, split if larger
- Use barrel exports (index.ts) for organized exports

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui + Radix UI + Tailwind CSS 4
- **Auth**: Session-based with email/password
- **Database**:
  - Local: SQLite (dev)
  - Production: PostgreSQL via Supabase with pooling
- **ORM**: Drizzle ORM
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: npm
- **Styling**: Tailwind CSS 4 + PostCSS
- **Integrations**: GoHighLevel (CRM sync), Webhooks

## Code Quality - Zero Tolerance

After editing ANY file, run:

```bash
npm run lint              # ESLint (fix all warnings)
npm run typecheck         # TypeScript (strict mode)
npm run build             # Verify build succeeds
```

Fix ALL errors/warnings before continuing.

## Development Workflow

### Start Development

```bash
npm install               # Install dependencies
npm run dev               # Start dev server (http://localhost:3000)
```

### Common Commands

```bash
npm run lint              # Run ESLint
npm run lint -- --fix     # Auto-fix ESLint issues
npm run typecheck         # TypeScript type checking
npm run build             # Production build
npm run test              # Run tests (when configured)
```

### Database Setup

```bash
# Migrations will be handled with Drizzle Kit
# For now: database auto-initializes on first run
```

## File Naming

- **Components**: PascalCase (e.g., `LoginForm.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `formatDeposit.ts`)
- **Types**: PascalCase (e.g., `User.ts`)
- **Directories**: kebab-case (e.g., `api-routes/`)

## Features Implemented

✅ Landing page with hero section
✅ User signup/login (session-based)
✅ Dashboard with sidebar navigation
✅ Multi-tenant organization management
✅ Lead/contact management (CRUD)
✅ Lead filtering (status, source)
✅ Auto-generated company tags (from org name)
✅ GoHighLevel integration with auto-sync
✅ Custom field mapping to GHL (AC Guys)
✅ Webhook support for external integrations
✅ Supabase PostgreSQL with connection pooling
✅ SQLite for local development
✅ TypeScript strict mode
✅ Responsive design (mobile-first)

## Integrations

### GoHighLevel (AC Guys)
- **Auto-sync**: Leads automatically sync to GHL on creation
- **Field Mapping**:
  - Service → `contact.tracker_service`
  - Source → `contact.tracker_source`
  - Estimate Amount → `contact.tracker_revenue`
  - Estimate Status → `contact.tracker_estimatestatus`
  - Close Status → `contact.tracker_closestatus`
  - Company Tag → Sent as contact tag
- **Upsert Logic**: Creates new contact if email doesn't exist, updates if exists
- **Non-blocking**: GHL sync failures don't prevent lead creation

## Supabase Views (CSV Export)

Four SQL views created for easy data export:

1. **`leads_with_company`** - All leads with org info (main export)
   - Columns: Contact Name, Email, Phone, Service, Source, Amount, Status, Company, Tags, Date
   - Use for: General reporting, data analysis

2. **`leads_summary_by_company`** - Summary stats by company tag
   - Columns: Company Tag, Total Leads, Won Count, Lost Count, Open Count, Revenue
   - Use for: KPIs, company performance tracking

3. **`open_leads_export`** - Open leads only (formatted)
   - Columns: Contact Name, Email, Phone, Service, Source, Company
   - Use for: Follow-up lists, active pipeline

4. **`won_leads_export`** - Won deals (revenue tracking)
   - Columns: Contact Name, Email, Phone, Service, Company, Amount, Date
   - Use for: Revenue reports, success tracking

**To export:**
- Supabase → Table Editor → Select view
- Click **Download** button
- Opens as CSV in Excel/Google Sheets

## Next Steps

- Add contact detail editing UI
- Implement lead status update workflows
- Add bulk actions (bulk tag, bulk status update)
- Create API endpoint for view exports
- Testing setup (Vitest)

## Environment Variables

Create `.env.local` (local dev):

```
# Database - SQLite for local development
# DATABASE_URL=postgresql://...  # Uncomment to use Supabase locally

# Supabase (production via Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GoHighLevel Integration
GHL_LOCATION_ID=your-location-id
GHL_PRIVATE_INTEGRATION_TOKEN=your-private-token
GHL_BASE_URL=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28

# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Production (Vercel)

Set these environment variables in Vercel dashboard:
- `DATABASE_URL` - Supabase PostgreSQL pooling connection string
- `GHL_*` - GoHighLevel credentials
- `NEXTAUTH_SECRET` - Production secret key
- `NEXTAUTH_URL` - Production domain

## Deployment Notes

- **Local**: Uses SQLite (auto-initialized at `/api/dev/init-db`)
- **Production**: Uses Supabase PostgreSQL with connection pooling
- **Deployment**: Via Vercel with automatic HTTPS
- **Build output**: `.next/`
- **Database**: Auto-migrates schema on deploy

## Code Quality Checklist

Before committing:
1. ✅ Run `npm run lint`
2. ✅ Run `npm run typecheck`
3. ✅ Run `npm run build`
4. ✅ Test manually in browser
5. ✅ Commit with descriptive message

