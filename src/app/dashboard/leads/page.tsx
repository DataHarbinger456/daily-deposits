import { OpenLeadsList } from '@/components/leads/OpenLeadsList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// TODO: Get orgId from session/auth context
const DEMO_ORG_ID = 'org_demo_123';

export default function OpenLeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Open Leads</h1>
          <p className="text-sm text-slate-600 mt-1">
            All unclosed leads across all dates
          </p>
        </div>
        <Link href="/dashboard/record">
          <Button size="sm">+ Record Lead</Button>
        </Link>
      </div>

      {/* Leads list */}
      <OpenLeadsList orgId={DEMO_ORG_ID} />
    </div>
  );
}
