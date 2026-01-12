'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

const DEMO_USER_ID = 'user_demo_123';

interface OrgData {
  id: string;
  name: string;
  userId: string;
  services: Array<{ id: string; name: string }>;
  sources: Array<{ id: string; name: string }>;
}

export default function SubaccountPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const response = await fetch(`/api/org/get?orgId=${orgId}&userId=${DEMO_USER_ID}`);
        if (response.ok) {
          const data = await response.json();
          setOrgData(data);
        }
      } catch (error) {
        console.error('Error fetching org data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgData();
  }, [orgId]);

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!orgData) {
    return (
      <div className="p-6">
        <p className="text-red-600">Organization not found</p>
        <Link href="/dashboard/agency" className="text-blue-600 hover:underline mt-4 block">
          Back to Agency Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{orgData.name}</h1>
          <p className="text-slate-600 mt-1">Viewing client account in agency mode</p>
        </div>
        <Link href="/dashboard/agency" className="text-blue-600 hover:underline">
          Back to Agency Dashboard
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-slate-600">Services Configured</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{orgData.services.length}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600">Lead Sources</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{orgData.sources.length}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600">Account ID</p>
          <p className="text-xs font-mono text-slate-600 mt-2 break-all">{orgData.id}</p>
        </Card>
      </div>

      {/* Services & Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Services</h3>
          <div className="space-y-2">
            {orgData.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border"
              >
                <span className="font-medium text-sm">{service.name}</span>
              </div>
            ))}
          </div>
          {orgData.services.length === 0 && (
            <p className="text-slate-500 text-sm">No services configured</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Lead Sources</h3>
          <div className="space-y-2">
            {orgData.sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border"
              >
                <span className="font-medium text-sm">{source.name}</span>
              </div>
            ))}
          </div>
          {orgData.sources.length === 0 && (
            <p className="text-slate-500 text-sm">No sources configured</p>
          )}
        </Card>
      </div>

      {/* Agency Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Agency Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href={`/dashboard/org/${orgId}/settings`}
            className="p-3 border rounded hover:bg-blue-50 text-center transition-colors"
          >
            <div className="text-xl mb-2">⚙️</div>
            <p className="text-sm font-medium">Settings</p>
          </Link>
          <button className="p-3 border rounded hover:bg-red-50 text-center transition-colors text-red-600">
            <div className="text-xl mb-2">🗑️</div>
            <p className="text-sm font-medium">Delete Account</p>
          </button>
          <button className="p-3 border rounded hover:bg-blue-50 text-center transition-colors">
            <div className="text-xl mb-2">👤</div>
            <p className="text-sm font-medium">Team</p>
          </button>
          <button className="p-3 border rounded hover:bg-blue-50 text-center transition-colors">
            <div className="text-xl mb-2">🔔</div>
            <p className="text-sm font-medium">Notifications</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
