'use client';

import { useEffect, useState, useCallback } from 'react';
import { ServicesList } from '@/components/org/ServicesList';
import { SourcesList } from '@/components/org/SourcesList';
import { WebhookSettings } from '@/components/org/WebhookSettings';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface OrgData {
  id: string;
  name: string;
  userId: string;
  webhookUrl?: string;
  services: Array<{ id: string; name: string; orgId: string }>;
  sources: Array<{ id: string; name: string; orgId: string }>;
}

export default function SettingsPage() {
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrgData = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      // Get userId from cookie
      const cookies = document.cookie.split('; ');
      const userIdCookie = cookies.find((c) => c.startsWith('userId='));
      if (!userIdCookie) {
        throw new Error('User not authenticated');
      }

      const userId = userIdCookie.split('=')[1];
      const userResponse = await fetch(`/api/user/current?userId=${userId}`);

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      const orgId = userData.currentOrg?.id;

      if (!orgId) {
        throw new Error('No organization found');
      }

      const response = await fetch(`/api/org/get?orgId=${orgId}`, {
        headers: { 'x-user-id': userId },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch organization data');
      }

      const data = await response.json();
      setOrgData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrgData();
  }, [fetchOrgData]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading organization settings...</p>
        </div>
      </div>
    );
  }

  if (!orgData) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card className="p-6">
          <p className="text-red-600">Failed to load organization settings</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Organization Settings</h1>
        <p className="text-gray-600">Manage your services and lead sources</p>
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

      <Card className="p-6 mt-6">
        <WebhookSettings
          orgId={orgData.id}
          userId={orgData.userId}
          initialWebhookUrl={orgData.webhookUrl}
          onSuccess={fetchOrgData}
        />
      </Card>

      <Card className="p-6 mt-6">
        <h3 className="font-semibold text-lg mb-2">Organization Details</h3>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{orgData.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Organization ID</p>
            <p className="font-mono text-sm">{orgData.id}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
