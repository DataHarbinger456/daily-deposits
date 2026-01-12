'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WebhookSettingsProps {
  orgId: string;
  userId: string;
  initialWebhookUrl?: string;
  onSuccess?: () => void;
}

export function WebhookSettings({
  orgId,
  userId,
  initialWebhookUrl = '',
  onSuccess,
}: WebhookSettingsProps) {
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/org/update-webhook', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          orgId,
          webhookUrl: webhookUrl || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update webhook');
      }

      setMessage({ type: 'success', text: 'Webhook URL saved successfully!' });
      onSuccess?.();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save webhook URL',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-2">Webhook URL</h3>
        <p className="text-sm text-slate-600 mb-4">
          Configure a webhook URL to automatically send lead data to your system.
          Leads recorded in Daily Deposits will be sent to this URL for processing and integration.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhookUrl" className="font-semibold">
          Webhook URL
        </Label>
        <Input
          id="webhookUrl"
          type="url"
          placeholder="https://webhook.site/your-webhook-id"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          disabled={isSaving}
          className="text-base py-3"
        />
        <p className="text-xs text-slate-500 mt-2">
          Enter the webhook URL where lead data should be sent
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
          {isSaving ? 'Saving...' : '✓ Save Webhook'}
        </Button>
        {webhookUrl && (
          <Button
            onClick={() => {
              setWebhookUrl('');
              handleSave();
            }}
            variant="outline"
            disabled={isSaving}
            className="text-red-600 hover:bg-red-50"
          >
            Clear Webhook
          </Button>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Enter your webhook URL above</li>
          <li>When you record a new lead, the lead data will be sent to your webhook</li>
          <li>Use n8n, Zapier, Make, or any other integration platform to process the data</li>
          <li>Ensure your webhook URL is active and accessible</li>
        </ul>
      </div>
    </div>
  );
}
