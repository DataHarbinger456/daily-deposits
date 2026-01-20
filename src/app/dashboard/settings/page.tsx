'use client';

import { useEffect, useState, useCallback } from 'react';
import { ServicesList } from '@/components/org/ServicesList';
import { SourcesList } from '@/components/org/SourcesList';
import { CompanyTagSettings } from '@/components/org/CompanyTagSettings';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface OrgData {
  id: string;
  name: string;
  userId: string;
  companyTag?: string;
  googleSheetsSpreadsheetId?: string;
  services: Array<{ id: string; name: string; orgId: string }>;
  sources: Array<{ id: string; name: string; orgId: string }>;
}

const SERVICE_ACCOUNT_EMAIL = 'daily-deposits-sheets-sync@daily-deposits-484815.iam.gserviceaccount.com';

export default function SettingsPage() {
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetInput, setSheetInput] = useState('');
  const [sheetId, setSheetId] = useState('');
  const [isSavingSheet, setIsSavingSheet] = useState(false);
  const [sheetMessage, setSheetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const fetchOrgData = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const viewingOrgId = sessionStorage.getItem('viewingOrgId');
      const meUrl = `/api/me${viewingOrgId ? `?viewingOrgId=${viewingOrgId}` : ''}`;
      const userResponse = await fetch(meUrl);

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      const orgId = userData.currentOrg?.id;
      const userId = userData.user.id;

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
      setOrgData({ ...data.org, services: data.services, sources: data.sources });
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

  const handleSheetInputChange = (value: string) => {
    setSheetInput(value);
    // Extract ID from URL like: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
    const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      setSheetId(match[1]);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(SERVICE_ACCOUNT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy to clipboard');
    }
  };

  const handleSaveSheet = async () => {
    if (!sheetId.trim()) {
      setSheetMessage({ type: 'error', text: 'Please enter a Google Sheets ID' });
      return;
    }

    if (!orgData) return;

    setIsSavingSheet(true);
    setSheetMessage(null);

    try {
      const response = await fetch('/api/org/update-google-sheets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': orgData.userId,
        },
        body: JSON.stringify({
          orgId: orgData.id,
          googleSheetsSpreadsheetId: sheetId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update Google Sheets ID');
      }

      setSheetMessage({ type: 'success', text: '✓ Google Sheets connected successfully!' });
      setSheetInput('');
      fetchOrgData();
    } catch (error) {
      setSheetMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save Google Sheets ID',
      });
    } finally {
      setIsSavingSheet(false);
    }
  };

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
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Google Sheets Integration</h3>
            <p className="text-sm text-slate-600 mb-4">
              Connect your Google Sheet to automatically sync leads. Your leads will be organized by company tag in separate tabs.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Step 1: Share your Google Sheet</h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Open your Google Sheet</li>
              <li>Click Share button (top right)</li>
              <li>Copy this email and paste it in the "Add people" field:</li>
            </ol>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-white border border-blue-300 rounded px-3 py-2 font-mono text-sm break-all">
                {SERVICE_ACCOUNT_EMAIL}
              </div>
              <button
                onClick={copyToClipboard}
                className="flex-shrink-0 p-2 hover:bg-blue-100 rounded transition-colors text-blue-700"
                title="Copy to clipboard"
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>

            <p className="text-xs text-blue-700 mt-2">Give them <span className="font-semibold">Editor</span> permissions, then click Share.</p>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-sm">Step 2: Paste your Google Sheet URL or ID</label>
            <input
              type="text"
              placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit or paste just the ID"
              value={sheetInput || sheetId}
              onChange={(e) => handleSheetInputChange(e.target.value)}
              disabled={isSavingSheet}
              className="w-full text-base py-3 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500">
              Enter the full Google Sheet URL or just the spreadsheet ID
            </p>
          </div>

          {sheetMessage && (
            <div
              className={`rounded-lg p-3 text-sm ${
                sheetMessage.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {sheetMessage.text}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveSheet}
              disabled={isSavingSheet || !sheetId.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded font-semibold"
            >
              {isSavingSheet ? 'Connecting...' : '✓ Connect Sheet'}
            </button>
            {sheetId && (
              <button
                onClick={() => {
                  setSheetId('');
                  setSheetInput('');
                }}
                disabled={isSavingSheet}
                className="px-4 py-2 border border-gray-300 rounded text-red-600 hover:bg-red-50"
              >
                Clear
              </button>
            )}
          </div>

          {orgData?.googleSheetsSpreadsheetId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                <span className="font-semibold">✓ Connected</span> - Leads will sync to your Google Sheet automatically
              </p>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">How it works:</h4>
            <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
              <li>When you create a lead, it syncs to your Google Sheet</li>
              <li>A new tab is created for each company tag automatically</li>
              <li>Lead updates (status changes, notes, etc.) sync in real-time</li>
              <li>Share your sheet with team members to collaborate</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <CompanyTagSettings
          orgId={orgData.id}
          userId={orgData.userId}
          initialCompanyTag={orgData.companyTag}
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
