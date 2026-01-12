'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { ServicesList } from '@/components/org/ServicesList';
import { SourcesList } from '@/components/org/SourcesList';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface OrgData {
  id: string;
  name: string;
  userId: string;
  services: Array<{ id: string; name: string; orgId: string }>;
  sources: Array<{ id: string; name: string; orgId: string }>;
}

const DEMO_USER_ID = 'user_demo_123';

export default function SubaccountSettingsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrgData = useCallback(async () => {
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
  }, [orgId]);

  useEffect(() => {
    fetchOrgData();
  }, [fetchOrgData]);

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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-8">
        <Link
          href={`/dashboard/org/${orgId}`}
          className="text-blue-600 hover:underline text-sm mb-4 inline-block"
        >
          ← Back to Account
        </Link>
        <h1 className="text-3xl font-bold mb-2">Organization Settings</h1>
        <p className="text-gray-600">Managing settings for: {orgData.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <ServicesList
            services={orgData.services}
            orgId={orgData.id}
            userId={orgData.userId}
            onRefresh={fetchOrgData}
          />
        </Card>

        <Card className="p-6">
          <SourcesList
            sources={orgData.sources}
            orgId={orgData.id}
            userId={orgData.userId}
            onRefresh={fetchOrgData}
          />
        </Card>
      </div>
    </div>
  );
}
