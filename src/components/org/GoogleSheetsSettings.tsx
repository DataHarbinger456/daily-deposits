'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check } from 'lucide-react';

interface GoogleSheetsSettingsProps {
  orgId: string;
  userId: string;
  initialSpreadsheetId?: string;
  onSuccess?: () => void;
}

const SERVICE_ACCOUNT_EMAIL = 'daily-deposits-sheets-sync@daily-deposits-484815.iam.gserviceaccount.com';

export function GoogleSheetsSettings({
  orgId,
  userId,
  initialSpreadsheetId = '',
  onSuccess,
}: GoogleSheetsSettingsProps) {
  const [spreadsheetId, setSpreadsheetId] = useState(initialSpreadsheetId);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Extract spreadsheet ID from URL if user pastes full URL
  const handleUrlChange = (value: string) => {
    setSpreadsheetUrl(value);

    // Extract ID from URL like: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
    const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      setSpreadsheetId(match[1]);
    }
  };

  const handleSave = async () => {
    if (!spreadsheetId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a Google Sheets ID' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/org/update-google-sheets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          orgId,
          googleSheetsSpreadsheetId: spreadsheetId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update Google Sheets ID');
      }

      setMessage({ type: 'success', text: '✓ Google Sheets connected successfully!' });
      setSpreadsheetUrl('');
      onSuccess?.();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save Google Sheets ID',
      });
    } finally {
      setIsSaving(false);
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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-2">Google Sheets Integration</h3>
        <p className="text-sm text-slate-600 mb-4">
          Connect your Google Sheet to automatically sync leads. Your leads will be organized by company tag in separate tabs.
        </p>
      </div>

      {/* Step 1: Share Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">Step 1: Share your Google Sheet</h4>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Open your Google Sheet</li>
          <li>Click <span className="font-mono bg-white px-1">Share</span> button (top right)</li>
          <li>Copy this email and paste it in the "Add people" field:</li>
        </ol>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-white border border-blue-300 rounded px-3 py-2 font-mono text-sm break-all">
            {SERVICE_ACCOUNT_EMAIL}
          </div>
          <button
            onClick={copyToClipboard}
            className="flex-shrink-0 p-2 hover:bg-blue-100 rounded transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check size={18} className="text-green-600" />
            ) : (
              <Copy size={18} className="text-blue-700" />
            )}
          </button>
        </div>

        <p className="text-xs text-blue-700 mt-2">Give them <span className="font-semibold">Editor</span> permissions, then click Share.</p>
      </div>

      {/* Step 2: Paste Spreadsheet URL or ID */}
      <div className="space-y-2">
        <Label htmlFor="sheetUrl" className="font-semibold">
          Step 2: Paste your Google Sheet URL or ID
        </Label>
        <Input
          id="sheetUrl"
          type="url"
          placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit or paste just the ID"
          value={spreadsheetUrl || spreadsheetId}
          onChange={(e) => handleUrlChange(e.target.value)}
          disabled={isSaving}
          className="text-base py-3"
        />
        <p className="text-xs text-slate-500">
          Enter the full Google Sheet URL or just the spreadsheet ID
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || !spreadsheetId.trim()}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? 'Connecting...' : '✓ Connect Sheet'}
        </Button>
        {spreadsheetId && (
          <Button
            onClick={() => {
              setSpreadsheetId('');
              setSpreadsheetUrl('');
            }}
            variant="outline"
            disabled={isSaving}
            className="text-red-600 hover:bg-red-50"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Current Status */}
      {initialSpreadsheetId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">
            <span className="font-semibold">✓ Connected</span> - Leads will sync to your Google Sheet automatically
          </p>
        </div>
      )}

      {/* How it Works */}
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
  );
}
