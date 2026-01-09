import { LeadForm } from '@/components/leads/LeadForm';

// TODO: Get orgId from session/auth context
const DEMO_ORG_ID = 'org_demo_123';

export default function RecordLeadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Record Lead</h1>
        <p className="text-sm text-slate-600 mt-1">
          Log a new lead in 30 seconds
        </p>
      </div>

      {/* Form Container - Mobile optimized */}
      <div className="max-w-md mx-auto bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <LeadForm orgId={DEMO_ORG_ID} />
      </div>

      {/* Quick Tips */}
      <div className="max-w-md mx-auto bg-blue-50 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-semibold mb-2">💡 Pro Tip</p>
        <p>
          Keep this simple. The faster you log leads, the better your data.
          You can update details later.
        </p>
      </div>
    </div>
  );
}
