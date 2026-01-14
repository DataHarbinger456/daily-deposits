'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CompanyTagSettingsProps {
  orgId: string;
  userId: string;
  initialCompanyTag?: string;
  onSuccess?: () => void;
}

export function CompanyTagSettings({
  orgId,
  userId,
  initialCompanyTag = '',
  onSuccess,
}: CompanyTagSettingsProps) {
  const [companyTag, setCompanyTag] = useState(initialCompanyTag);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/org/update-company-tag', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          orgId,
          companyTag: companyTag || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update company tag');
      }

      setMessage({ type: 'success', text: 'Company tag saved successfully!' });
      onSuccess?.();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save company tag',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-2">Company Tag</h3>
        <p className="text-sm text-slate-600 mb-4">
          Set a company tag that will automatically be added to all leads created in this organization.
          Tags are formatted in lowercase with spaces (e.g., &quot;elite tree services&quot;).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyTag" className="font-semibold">
          Company Tag
        </Label>
        <Input
          id="companyTag"
          type="text"
          placeholder="e.g., elite tree services"
          value={companyTag}
          onChange={(e) => setCompanyTag(e.target.value)}
          disabled={isSaving}
          className="text-base py-3"
        />
        <p className="text-xs text-slate-500 mt-2">
          This tag will be automatically added to all leads for this organization
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
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? 'Saving...' : '✓ Save Company Tag'}
        </Button>
        {companyTag && (
          <Button
            onClick={() => {
              setCompanyTag('');
            }}
            variant="outline"
            disabled={isSaving}
            className="text-red-600 hover:bg-red-50"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Enter your company tag above (lowercase with spaces)</li>
          <li>When you create a new lead, this tag will automatically be added</li>
          <li>Tags are compatible with GoHighLevel and other CRM systems</li>
          <li>Future: Tags will be used to organize leads in Google Sheets exports</li>
        </ul>
      </div>
    </div>
  );
}
