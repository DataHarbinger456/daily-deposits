'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardMetrics {
  metrics: {
    totalRevenue: number;
    totalLeads: number;
    wonLeads: number;
    openLeads: number;
    winRate: number;
    averageDealSize: number;
  };
  revenueBySource: Record<string, { revenue: number; count: number }>;
  volumeBySource: Record<string, number>;
  closeRateBySource: Record<string, { rate: number; won: number; total: number }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        if (typeof window === 'undefined') return;

        const viewingOrgId = sessionStorage.getItem('viewingOrgId');

        // Get current user from /api/me
        const userUrl = `/api/me${viewingOrgId ? `?viewingOrgId=${viewingOrgId}` : ''}`;
        const userResponse = await fetch(userUrl);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();

        // Agency users should go to /dashboard/agency unless explicitly viewing a sub-account
        if (userData.isAgency && !viewingOrgId) {
          router.push('/dashboard/agency');
          return;
        }

        if (!userData.currentOrg) {
          setError('No organization found');
          return;
        }

        const orgId = userData.currentOrg.id;
        const userId = userData.user.id;

        // Fetch metrics
        const metricsResponse = await fetch(
          `/api/dashboard/metrics?orgId=${orgId}&userId=${userId}`
        );
        if (!metricsResponse.ok) {
          throw new Error('Failed to fetch metrics');
        }

        const metricsData = await metricsResponse.json();
        setData(metricsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { metrics, revenueBySource, volumeBySource, closeRateBySource } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Track your leads and revenue performance</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ${metrics.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">{metrics.wonLeads} deals won</p>
        </div>

        {/* Open Leads */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Open Leads</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.openLeads}</p>
          <p className="text-xs text-slate-500 mt-1">Waiting for follow-up</p>
        </div>

        {/* Win Rate */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Win Rate</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{metrics.winRate.toFixed(1)}%</p>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.wonLeads} / {metrics.totalLeads} leads
          </p>
        </div>

        {/* Average Deal Size */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Avg Deal Size</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            ${metrics.averageDealSize.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Per won deal</p>
        </div>
      </div>

      {/* Revenue by Source */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Lead Source</h2>
        <div className="space-y-3">
          {Object.entries(revenueBySource).length === 0 ? (
            <p className="text-slate-500 text-sm">No revenue yet - mark some leads as won!</p>
          ) : (
            Object.entries(revenueBySource)
              .sort(([, a], [, b]) => b.revenue - a.revenue)
              .map(([source, data]) => (
                <div key={source} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <div>
                    <p className="font-medium text-slate-900">{source}</p>
                    <p className="text-xs text-slate-600">{data.count} deals closed</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    ${data.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Close Rate by Source */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Close Rate by Source</h2>
        <div className="space-y-3">
          {Object.entries(closeRateBySource).length === 0 ? (
            <p className="text-slate-500 text-sm">No leads yet</p>
          ) : (
            Object.entries(closeRateBySource)
              .sort(([, a], [, b]) => b.rate - a.rate)
              .map(([source, data]) => (
                <div key={source} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <div>
                    <p className="font-medium text-slate-900">{source}</p>
                    <p className="text-xs text-slate-600">
                      {data.won} of {data.total} leads converted
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{data.rate.toFixed(1)}%</p>
                    <div className="w-24 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${data.rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Lead Volume by Source */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Lead Volume by Source</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(volumeBySource).length === 0 ? (
            <p className="text-slate-500 text-sm">No leads yet</p>
          ) : (
            Object.entries(volumeBySource)
              .sort(([, a], [, b]) => b - a)
              .map(([source, volume]) => (
                <div key={source} className="p-4 bg-slate-50 rounded border border-slate-200">
                  <p className="font-medium text-slate-900">{source}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{volume}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {((volume / metrics.totalLeads) * 100).toFixed(1)}% of total
                  </p>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/record">
            <Button size="lg" className="w-full justify-start">
              ➕ Record New Lead
            </Button>
          </Link>
          <Link href="/dashboard/leads">
            <Button size="lg" variant="outline" className="w-full justify-start">
              📋 View All Contacts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
