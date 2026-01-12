'use client';

import { useState, useEffect } from 'react';
import { LeadForm } from '@/components/leads/LeadForm';

export default function RecordLeadPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserOrg = async () => {
      try {
        if (typeof window === 'undefined') return;

        const cookies = document.cookie.split('; ');
        const userIdCookie = cookies.find((c) => c.startsWith('userId='));
        if (!userIdCookie) {
          setError('Not authenticated. Please log in.');
          setIsLoading(false);
          return;
        }

        const userId = userIdCookie.split('=')[1];
        console.log('Fetching user data for:', userId);

        const response = await fetch(`/api/user/current?userId=${userId}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`);
        }

        const data = await response.json();
        console.log('User data:', data);
        setOrgId(data.currentOrg.id);
        setIsLoading(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching org:', errorMsg);
        setError(`Error loading form: ${errorMsg}`);
        setIsLoading(false);
      }
    };

    fetchUserOrg();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="rounded-lg bg-red-50 p-4 text-red-700 max-w-md">
          <p className="font-semibold mb-2">Error</p>
          <p className="text-sm mb-4">{error}</p>
          <a href="/login" className="text-blue-600 underline text-sm">
            Go back to login
          </a>
        </div>
      </div>
    );
  }

  if (isLoading || !orgId) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

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
        <LeadForm orgId={orgId} />
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
