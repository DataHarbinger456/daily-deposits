import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total Deposits</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">$12,345.00</p>
          <p className="text-xs text-slate-500 mt-1">+5% from last month</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">This Month</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">$2,450.00</p>
          <p className="text-xs text-slate-500 mt-1">12 deposits</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Average Deposit</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">$204.17</p>
          <p className="text-xs text-slate-500 mt-1">Per transaction</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button size="lg" className="justify-start">
            💰 Record Deposit
          </Button>
          <Button size="lg" variant="outline" className="justify-start">
            📊 View Reports
          </Button>
        </div>
      </div>

      {/* Placeholder for chart */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded border border-slate-200">
          <p className="text-slate-500">Chart placeholder - design coming soon</p>
        </div>
      </div>
    </div>
  );
}
