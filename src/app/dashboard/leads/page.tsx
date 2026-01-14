'use client';

import { useState, useEffect } from 'react';
import { OpenLeadsList } from '@/components/leads/OpenLeadsList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OpenLeadsPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrg = async () => {
      try {
        if (typeof window === 'undefined') return;

        const viewingOrgId = sessionStorage.getItem('viewingOrgId');
        const url = `/api/me${viewingOrgId ? `?viewingOrgId=${viewingOrgId}` : ''}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setOrgId(data.currentOrg?.id || null);
        }
      } catch (error) {
        console.error('Error fetching org:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserOrg();
  }, []);

  if (isLoading || !orgId) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
          <p className="text-sm text-slate-600 mt-1">
            View and manage all your contacts
          </p>
        </div>
        <Link href="/dashboard/record">
          <Button size="sm">+ Record Lead</Button>
        </Link>
      </div>

      {/* Leads list */}
      <OpenLeadsList orgId={orgId} />
    </div>
  );
}
