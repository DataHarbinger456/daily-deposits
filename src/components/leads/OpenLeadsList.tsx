'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Lead {
  id: string;
  service: string;
  source: string;
  contactName?: string;
  closeStatus: string;
  estimateStatus: string;
  createdAt: string;
}

interface OpenLeadsListProps {
  orgId: string;
}

export function OpenLeadsList({ orgId }: OpenLeadsListProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch(
          `/api/leads/list?orgId=${orgId}`,
          {
            headers: { 'x-user-id': 'current-user' },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }

        const data = await response.json();
        setLeads(data.leads);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load leads'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [orgId]);

  const handleStatusUpdate = async (
    leadId: string,
    newStatus: 'WON' | 'LOST'
  ) => {
    try {
      const response = await fetch('/api/leads/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'current-user',
        },
        body: JSON.stringify({
          leadId,
          closeStatus: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      // Remove lead from list (since it's no longer open)
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Loading leads...</p>
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

  if (leads.length === 0) {
    return (
      <div className="rounded-lg bg-slate-50 p-8 text-center">
        <p className="text-slate-600 font-semibold">No open leads</p>
        <p className="text-sm text-slate-500 mt-1">
          All your leads are closed!
        </p>
        <Link href="/dashboard/record">
          <Button className="mt-4">Record New Lead</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">
                {lead.contactName || 'Unnamed Lead'}
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Service:</span> {lead.service}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Source:</span> {lead.source}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Status buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleStatusUpdate(lead.id, 'WON')}
                className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
              >
                ✓ Won
              </button>
              <button
                onClick={() => handleStatusUpdate(lead.id, 'LOST')}
                className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
              >
                ✗ Lost
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
