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
- **Auth**: Auth.js (NextAuth) with email/password
- **Database**: SQLite (local) → PostgreSQL (production)
- **ORM**: Drizzle ORM
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: npm
- **Styling**: Tailwind CSS 4 + PostCSS

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
✅ Authentication pages (login/signup)
✅ Dashboard layout with sidebar navigation
✅ User registration API
✅ Database schema (SQLite/PostgreSQL ready)
✅ shadcn/ui component library
✅ TypeScript strict mode
✅ Responsive design (mobile-first)

## Next Steps

- Integrate Auth.js for session management
- Create deposit recording UI/API
- Add analytics/charts
- Design refinements from Dribbble/21st.dev/Coconut UI
- Implement reports and exports
- Multi-tenant data isolation
- Testing setup (Vitest)

## Environment Variables

Create `.env.local`:

```
# Database
DATABASE_URL=sqlite:///dev.db  # SQLite for local dev
# DATABASE_URL=postgresql://...  # PostgreSQL for production

# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Deployment Notes

- Production uses PostgreSQL (set DATABASE_URL)
- Auth session stored in database
- Static assets deployed to CDN
- Build output: `.next/`

## Code Quality Checklist

Before committing:
1. ✅ Run `npm run lint`
2. ✅ Run `npm run typecheck`
3. ✅ Run `npm run build`
4. ✅ Test manually in browser
5. ✅ Commit with descriptive message

