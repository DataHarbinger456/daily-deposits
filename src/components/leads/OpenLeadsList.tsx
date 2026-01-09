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

const ESTIMATE_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: '⏳ Pending' },
  SCHEDULED: { bg: 'bg-blue-50', text: 'text-blue-700', label: '📅 Scheduled' },
  COMPLETED: { bg: 'bg-purple-50', text: 'text-purple-700', label: '✓ Completed' },
  NO_SHOW: { bg: 'bg-red-50', text: 'text-red-700', label: '✗ No Show' },
};

export function OpenLeadsList({ orgId }: OpenLeadsListProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

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

  // Get unique sources for filter
  const sources = Array.from(new Set(leads.map((l) => l.source)));

  // Filter and sort leads
  let filteredLeads = filterSource
    ? leads.filter((l) => l.source === filterSource)
    : leads;

  if (sortBy === 'oldest') {
    filteredLeads = [...filteredLeads].reverse();
  }

  const stats = {
    total: leads.length,
    pending: leads.filter((l) => l.estimateStatus === 'PENDING').length,
    scheduled: leads.filter((l) => l.estimateStatus === 'SCHEDULED').length,
    completed: leads.filter((l) => l.estimateStatus === 'COMPLETED').length,
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
      <div className="rounded-lg bg-slate-50 p-12 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-slate-600 font-semibold text-lg">No open leads</p>
        <p className="text-sm text-slate-500 mt-2">
          All your leads are closed! Time to record some new ones.
        </p>
        <Link href="/dashboard/record">
          <Button className="mt-6">+ Record New Lead</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-semibold">Total Open</p>
          <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600 font-semibold">Pending</p>
          <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600 font-semibold">Scheduled</p>
          <p className="text-3xl font-bold text-purple-900">{stats.scheduled}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-semibold">Completed</p>
          <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="text-sm font-semibold text-slate-700">Filter:</div>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 text-sm">
          <span className="font-semibold text-slate-700">Sort:</span>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1 rounded ${
              sortBy === 'newest'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy('oldest')}
            className={`px-3 py-1 rounded ${
              sortBy === 'oldest'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      {/* Leads Table/List */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No leads match this filter.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const estimateColor =
              ESTIMATE_STATUS_COLORS[lead.estimateStatus];
            return (
              <div
                key={lead.id}
                className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Lead Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="font-bold text-lg text-slate-900 truncate">
                        {lead.contactName || 'Unnamed Lead'}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${estimateColor.bg} ${estimateColor.text}`}
                      >
                        {estimateColor.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Service</p>
                        <p className="font-semibold text-slate-900">
                          {lead.service}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Source</p>
                        <p className="font-semibold text-slate-900">
                          {lead.source}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Date</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Days Open</p>
                        <p className="font-semibold text-slate-900">
                          {Math.floor(
                            (Date.now() - new Date(lead.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                          days
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:flex-col sm:gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleStatusUpdate(lead.id, 'WON')}
                      className="flex-1 sm:w-auto rounded-lg bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-200 transition-colors"
                    >
                      ✓ Won
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(lead.id, 'LOST')}
                      className="flex-1 sm:w-auto rounded-lg bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-200 transition-colors"
                    >
                      ✗ Lost
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-4 flex justify-center">
        <Link href="/dashboard/record">
          <Button variant="outline">+ Record More Leads</Button>
        </Link>
      </div>
    </div>
  );
}
