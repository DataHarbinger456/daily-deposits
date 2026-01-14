'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit2 } from 'lucide-react';
import { ContactDetailModal } from './ContactDetailModal';

interface Lead {
  id: string;
  orgId: string;
  service: string;
  source: string;
  contactName?: string;
  email?: string;
  phone?: string;
  estimateAmount?: number;
  estimateStatus: string;
  closeStatus: string;
  notes?: string;
  createdAt: number;
}

interface Service {
  id: string;
  name: string;
  orgId: string;
}

interface Source {
  id: string;
  name: string;
  orgId: string;
}

interface OpenLeadsListProps {
  orgId: string;
}

// Helper function to get day of week
function getDayOfWeek(date: Date): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[date.getDay()];
}

// Helper function to group leads by day of week
function groupByDayOfWeek(leads: Lead[]): Map<string, Lead[]> {
  const grouped = new Map<string, Lead[]>();

  leads.forEach((lead) => {
    const date = new Date(lead.createdAt);
    const dayOfWeek = getDayOfWeek(date);

    if (!grouped.has(dayOfWeek)) {
      grouped.set(dayOfWeek, []);
    }
    grouped.get(dayOfWeek)!.push(lead);
  });

  return grouped;
}

// Helper function to get the most recent date for a group
function getMostRecentDateForDay(leads: Lead[]): Date {
  if (leads.length === 0) return new Date(0);
  return new Date(Math.max(...leads.map((l) => new Date(l.createdAt).getTime())));
}

export function OpenLeadsList({ orgId }: OpenLeadsListProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string>('');
  const [filterCloseStatus, setFilterCloseStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedContact, setSelectedContact] = useState<Lead | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user from /api/me
        const meResponse = await fetch('/api/me');
        if (!meResponse.ok) {
          throw new Error('User not authenticated');
        }

        const meData = await meResponse.json();
        const id = meData.user.id;
        setUserId(id);

        // Fetch leads
        const statusParam = filterCloseStatus !== 'ALL' ? `&closeStatus=${filterCloseStatus}` : '';
        const leadsResponse = await fetch(`/api/leads/list?orgId=${orgId}${statusParam}`, {
          headers: { 'x-user-id': id },
        });

        if (!leadsResponse.ok) {
          throw new Error('Failed to fetch leads');
        }

        const leadsData = await leadsResponse.json();
        setLeads(leadsData.leads);

        // Fetch org data (services and sources)
        const orgResponse = await fetch(`/api/org/get?orgId=${orgId}`, {
          headers: { 'x-user-id': id },
        });

        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          setServices(orgData.services);
          setSources(orgData.sources);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load leads'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orgId, filterCloseStatus]);

  const handleStatusUpdate = async (
    leadId: string,
    fieldType: 'closeStatus' | 'estimateStatus',
    newStatus: string
  ) => {
    try {
      // Get current user from /api/me
      const meResponse = await fetch('/api/me');
      if (!meResponse.ok) {
        throw new Error('User not authenticated');
      }

      const meData = await meResponse.json();
      const userId = meData.user.id;
      const payload: Record<string, unknown> = { leadId };

      if (fieldType === 'closeStatus') {
        payload.closeStatus = newStatus;
      } else {
        payload.estimateStatus = newStatus;
      }

      const response = await fetch('/api/leads/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update lead (${response.status})`);
      }

      // Update lead status in local state
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                [fieldType]: newStatus,
              }
            : l
        )
      );
    } catch (err) {
      console.error('Update error:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to update lead'}`);
    }
  };

  // Get unique sources for filter dropdown
  const sourcesForFilter = useMemo(
    () => Array.from(new Set(leads.map((l) => l.source))),
    [leads]
  );

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = filterSource
      ? leads.filter((l) => l.source === filterSource)
      : leads;

    if (sortBy === 'oldest') {
      result = [...result].reverse();
    }

    return result;
  }, [leads, filterSource, sortBy]);

  // Memoize stats calculation
  const stats = useMemo(
    () => ({
      total: leads.length,
      pending: leads.filter((l) => l.estimateStatus === 'PENDING').length,
      scheduled: leads.filter((l) => l.estimateStatus === 'SCHEDULED').length,
      completed: leads.filter((l) => l.estimateStatus === 'COMPLETED').length,
    }),
    [leads]
  );

  // Memoize grouped and sorted leads for table rendering (must be before early returns)
  const groupedAndSortedLeads = useMemo(() => {
    if (filteredLeads.length === 0) return [];
    const grouped = groupByDayOfWeek(filteredLeads);
    const sortedDays = Array.from(grouped.entries()).sort((a, b) => {
      const dateA = getMostRecentDateForDay(a[1]);
      const dateB = getMostRecentDateForDay(b[1]);
      return dateB.getTime() - dateA.getTime();
    });
    return sortedDays;
  }, [filteredLeads]);

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
      <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="text-sm font-semibold text-slate-700">Filter by Source:</div>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sources</option>
              {sourcesForFilter.map((source) => (
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

        <div className="flex flex-wrap gap-2">
          <div className="text-sm font-semibold text-slate-700">Filter by Status:</div>
          <button
            onClick={() => setFilterCloseStatus('ALL')}
            className={`px-3 py-1 rounded text-sm ${
              filterCloseStatus === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Leads
          </button>
          <button
            onClick={() => setFilterCloseStatus('OPEN')}
            className={`px-3 py-1 rounded text-sm ${
              filterCloseStatus === 'OPEN'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilterCloseStatus('WON')}
            className={`px-3 py-1 rounded text-sm ${
              filterCloseStatus === 'WON'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Won
          </button>
          <button
            onClick={() => setFilterCloseStatus('LOST')}
            className={`px-3 py-1 rounded text-sm ${
              filterCloseStatus === 'LOST'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Lost
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No leads match this filter.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Est. Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Closed Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Created</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {groupedAndSortedLeads.flatMap(([dayOfWeek, leadsForDay]) => [
                  // Day separator row
                  <tr key={`day-${dayOfWeek}`} className="bg-slate-100 hover:bg-slate-100">
                    <td colSpan={10} className="px-6 py-3">
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">{dayOfWeek}</p>
                    </td>
                  </tr>,
                  // Lead rows for this day
                  ...leadsForDay.map((lead, index) => (
                    <tr
                      key={lead.id}
                      className={`border-b border-slate-200 hover:bg-slate-100 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-100'
                      }`}
                    >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {lead.contactName || 'Unnamed'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {lead.email || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {lead.phone || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {lead.service}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {lead.source}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {lead.estimateAmount ? `$${lead.estimateAmount.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.estimateStatus}
                      onChange={(e) => handleStatusUpdate(lead.id, 'estimateStatus', e.target.value)}
                      className={`text-sm px-2.5 py-1 rounded font-semibold border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${
                        lead.estimateStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : lead.estimateStatus === 'SCHEDULED'
                          ? 'bg-blue-100 text-blue-700'
                          : lead.estimateStatus === 'COMPLETED'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <option value="PENDING">⏳ Pending</option>
                      <option value="SCHEDULED">📅 Scheduled</option>
                      <option value="COMPLETED">✓ Completed</option>
                      <option value="NO_SHOW">✗ No Show</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.closeStatus}
                      onChange={(e) => handleStatusUpdate(lead.id, 'closeStatus', e.target.value)}
                      disabled={lead.estimateStatus === 'PENDING' || lead.estimateStatus === 'SCHEDULED'}
                      className={`text-sm px-2.5 py-1 rounded font-semibold border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${
                        lead.closeStatus === 'OPEN'
                          ? 'bg-blue-100 text-blue-700'
                          : lead.closeStatus === 'WON'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      } ${lead.estimateStatus === 'PENDING' || lead.estimateStatus === 'SCHEDULED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={
                        lead.estimateStatus === 'PENDING' || lead.estimateStatus === 'SCHEDULED'
                          ? 'Complete or no-show the estimate before marking as won/lost'
                          : ''
                      }
                    >
                      <option value="OPEN">🔵 Open</option>
                      <option
                        value="WON"
                        disabled={lead.estimateStatus === 'PENDING' || lead.estimateStatus === 'SCHEDULED'}
                      >
                        ✓ Won
                      </option>
                      <option
                        value="LOST"
                        disabled={lead.estimateStatus === 'PENDING' || lead.estimateStatus === 'SCHEDULED'}
                      >
                        ✗ Lost
                      </option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedContact(lead)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors"
                      title="Edit contact details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                    </tr>
                    )),
              ])}
            </tbody>
          </table>
        )}
      </div>

      <div className="pt-4 flex justify-center">
        <Link href="/dashboard/record">
          <Button variant="outline">+ Record More Leads</Button>
        </Link>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          services={services}
          sources={sources}
          onClose={() => setSelectedContact(null)}
          onSave={(updatedContact) => {
            setLeads((prev) =>
              prev.map((l) =>
                l.id === updatedContact.id ? { ...l, ...updatedContact } : l
              )
            );
          }}
          onDelete={(deletedLeadId) => {
            setLeads((prev) => prev.filter((l) => l.id !== deletedLeadId));
          }}
          userId={userId}
        />
      )}
    </div>
  );
}
