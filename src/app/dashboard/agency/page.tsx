'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface OrgStats {
  id: string;
  name: string;
  totalLeads: number;
}

const DEMO_USER_ID = 'user_demo_123';

export default function AgencyDashboardPage() {
  const [orgs, setOrgs] = useState<OrgStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await fetch(`/api/orgs/list?userId=${DEMO_USER_ID}`);
        if (response.ok) {
          const data = await response.json();
          setOrgs(data.orgs || []);
        }
      } catch (error) {
        console.error('Error fetching orgs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  const totalLeads = orgs.reduce((sum, org) => sum + org.totalLeads, 0);
  const totalOrgs = orgs.length;

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Agency Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of all your client accounts</p>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-slate-600">Total Accounts</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{totalOrgs}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600">Total Leads</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{totalLeads}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600">Avg Leads/Account</p>
          <p className="text-4xl font-bold text-green-600 mt-2">
            {totalOrgs > 0 ? Math.round(totalLeads / totalOrgs) : 0}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600">Revenue (MRR)</p>
          <p className="text-4xl font-bold text-purple-600 mt-2">$0</p>
          <p className="text-xs text-slate-500 mt-1">Coming soon</p>
        </Card>
      </div>

      {/* Client Accounts Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Your Client Accounts</h2>
          <Link
            href="/dashboard/agency/setup"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
          >
            Setup Guide <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {orgs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No client accounts yet</p>
            <Link
              href="/dashboard/agency/create-client"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create First Client Account
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orgs.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900">{org.name}</p>
                  <p className="text-xs text-slate-500">{org.id}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-blue-600">{org.totalLeads}</p>
                    <p className="text-xs text-slate-500">leads</p>
                  </div>
                  <Link
                    href={`/dashboard/org/${org.id}`}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    View Account
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/agency/setup"
            className="p-4 border rounded-lg hover:bg-blue-50 text-center transition-colors"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <p className="text-sm font-medium">Setup Guide</p>
          </Link>
          <Link
            href="/dashboard/agency/analytics"
            className="p-4 border rounded-lg hover:bg-blue-50 text-center transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm font-medium">Analytics</p>
          </Link>
          <Link
            href="/dashboard/agency/team"
            className="p-4 border rounded-lg hover:bg-blue-50 text-center transition-colors"
          >
            <div className="text-2xl mb-2">👥</div>
            <p className="text-sm font-medium">Team</p>
          </Link>
          <Link
            href="/dashboard/agency/billing"
            className="p-4 border rounded-lg hover:bg-blue-50 text-center transition-colors"
          >
            <div className="text-2xl mb-2">💳</div>
            <p className="text-sm font-medium">Billing</p>
          </Link>
        </div>
      </Card>
    </div>
  );
}
