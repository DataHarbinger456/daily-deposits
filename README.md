# Daily Deposits

A multi-tenant SaaS CRM for tracking and managing leads with automatic sync to GoHighLevel.

**Live**: https://daily-deposits-gilt.vercel.app

## Features

- **Multi-tenant**: Organizations with company tags
- **Lead Management**: Create, view, filter contacts
- **Auto-sync to GHL**: Leads automatically sync to GoHighLevel with custom fields
- **Supabase PostgreSQL**: Production database with connection pooling
- **SQLite Local Dev**: Zero-setup local development
- **Webhook Support**: Send lead data to external systems

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (uses SQLite)
npm run dev

# Open http://localhost:3000
```

### Production Deployment

Deployed on Vercel with Supabase PostgreSQL. Set environment variables in Vercel dashboard:

```
DATABASE_URL=postgresql://...  # Supabase pooling connection
GHL_LOCATION_ID=...
GHL_PRIVATE_INTEGRATION_TOKEN=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.com
```

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for detailed documentation.

```
src/
├── app/api/           # API endpoints
│   ├── auth/          # Login/signup
│   ├── leads/         # Lead CRUD + GHL sync
│   └── org/           # Organization management
├── components/        # React components
├── lib/               # Utilities & database
│   ├── db/            # Drizzle ORM schema
│   └── ghl-client.ts  # GoHighLevel integration
└── types/             # TypeScript definitions
```

## Key Files

- **Lead Creation**: `src/app/api/leads/create/route.ts` - Creates lead + Supabase + GHL sync
- **GHL Integration**: `src/lib/ghl-client.ts` - GoHighLevel API client
- **Database**: `src/lib/db/schema.ts` - Drizzle schema

## Environment

### Local (.env.local)
- Uses SQLite by default
- Optional: Set `DATABASE_URL` for Supabase testing

### Production (Vercel)
- **Database**: Supabase PostgreSQL with connection pooling
- **Region**: AWS (configurable)
- **Auth**: Session-based (7-day cookie)

## Code Quality

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript check
npm run build       # Production build
```

All must pass before committing.

## Testing

Create test lead:
1. Sign up at https://daily-deposits-gilt.vercel.app/signup
2. Create lead in Contacts
3. Verify in Supabase dashboard
4. Verify in GoHighLevel account

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/leads/create` - Create lead (+ auto-sync to GHL)
- `GET /api/leads/list` - List leads
- `POST /api/leads/update-status` - Update lead status
- `GET /api/org/get` - Get organization

## Technology

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL (Drizzle ORM)
- **Auth**: Session-based (email/password)
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Integrations**: GoHighLevel CRM

## License

MIT
