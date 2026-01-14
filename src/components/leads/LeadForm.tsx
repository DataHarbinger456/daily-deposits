'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface LeadFormProps {
  orgId: string;
  onSuccess?: () => void;
}

export function LeadForm({ orgId, onSuccess }: LeadFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    service: '',
    source: '',
    contactName: '',
    email: '',
    phone: '',
    estimateAmount: '',
    estimateStatus: 'PENDING',
    closeStatus: 'OPEN',
    notes: '',
  });

  // Fetch org data on mount
  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        // Get userId from /api/me
        const meResponse = await fetch('/api/me');
        if (!meResponse.ok) {
          throw new Error('User not authenticated');
        }
        const meData = await meResponse.json();
        const userId = meData.user.id;

        const response = await fetch(`/api/org/get?orgId=${orgId}`, {
          headers: { 'x-user-id': userId },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch organization data');
        }

        const data = await response.json();
        setServices(data.services);
        setSources(data.sources);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load form options'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgData();
  }, [orgId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Get userId from /api/me
      const meResponse = await fetch('/api/me');
      if (!meResponse.ok) {
        throw new Error('User not authenticated');
      }
      const meData = await meResponse.json();
      const userId = meData.user.id;
      const response = await fetch('/api/leads/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          orgId,
          service: formData.service,
          source: formData.source,
          contactName: formData.contactName || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          estimateAmount: formData.estimateAmount ? parseFloat(formData.estimateAmount) : undefined,
          estimateStatus: formData.estimateStatus,
          closeStatus: formData.closeStatus,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create lead');
      }

      // Reset form and show success
      setFormData({
        service: '',
        source: '',
        contactName: '',
        email: '',
        phone: '',
        estimateAmount: '',
        estimateStatus: 'PENDING',
        closeStatus: 'OPEN',
        notes: '',
      });
      setSuccessMessage('Lead recorded! ✓');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Call callback
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Service */}
      <div className="space-y-2">
        <Label htmlFor="service" className="font-semibold text-base">
          Service
        </Label>
        <select
          id="service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.name}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* Source */}
      <div className="space-y-2">
        <Label htmlFor="source" className="font-semibold text-base">
          Lead Source
        </Label>
        <select
          id="source"
          name="source"
          value={formData.source}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
        >
          <option value="">Select a source</option>
          {sources.map((source) => (
            <option key={source.id} value={source.name}>
              {source.name}
            </option>
          ))}
        </select>
      </div>

      {/* Contact Name */}
      <div className="space-y-2">
        <Label htmlFor="contactName" className="font-semibold text-base">
          Contact Name
        </Label>
        <Input
          id="contactName"
          name="contactName"
          type="text"
          placeholder="John Smith"
          value={formData.contactName}
          onChange={handleChange}
          disabled={isSubmitting}
          className="text-base py-3"
        />
      </div>

      {/* Email - Optional */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm text-slate-600">
          Email (optional)
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
          className="text-base py-3"
        />
      </div>

      {/* Phone - Optional */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm text-slate-600">
          Phone (optional)
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={handleChange}
          disabled={isSubmitting}
          className="text-base py-3"
        />
      </div>

      {/* Estimate Cost - Optional */}
      <div className="space-y-2">
        <Label htmlFor="estimateAmount" className="text-sm text-slate-600">
          Estimate Cost (optional)
        </Label>
        <Input
          id="estimateAmount"
          name="estimateAmount"
          type="number"
          step="0.01"
          min="0"
          placeholder="$1,500.00"
          value={formData.estimateAmount}
          onChange={handleChange}
          disabled={isSubmitting}
          className="text-base py-3"
        />
      </div>

      {/* Estimate Status */}
      <div className="space-y-2">
        <Label htmlFor="estimateStatus" className="font-semibold text-base">
          Estimate Status
        </Label>
        <select
          id="estimateStatus"
          name="estimateStatus"
          value={formData.estimateStatus}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
        >
          <option value="PENDING">⏳ Pending</option>
          <option value="SCHEDULED">📅 Scheduled</option>
          <option value="COMPLETED">✓ Completed</option>
          <option value="NO_SHOW">✗ No Show</option>
        </select>
      </div>

      {/* Close Status */}
      <div className="space-y-2">
        <Label htmlFor="closeStatus" className="font-semibold text-base">
          Close Status
        </Label>
        <select
          id="closeStatus"
          name="closeStatus"
          value={formData.closeStatus}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
        >
          <option value="OPEN">🔵 Open</option>
          <option value="WON">✓ Won</option>
          <option value="LOST">✗ Lost</option>
        </select>
      </div>

      {/* Notes - Optional, collapsible on mobile */}
      <details className="space-y-2">
        <summary className="cursor-pointer font-semibold text-base text-slate-700 hover:text-slate-900">
          + Add Notes (optional)
        </summary>
        <Input
          id="notes"
          name="notes"
          type="text"
          placeholder="Anything else? (Optional)"
          value={formData.notes}
          onChange={handleChange}
          disabled={isSubmitting}
          className="text-base py-3"
        />
      </details>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Submit Button - Big & Thumb-Friendly */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-6 text-base h-12"
        size="lg"
      >
        {isSubmitting ? 'Recording...' : '✓ Record Lead'}
      </Button>
    </form>
  );
}
