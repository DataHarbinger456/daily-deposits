'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface Contact {
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

interface ContactDetailModalProps {
  contact: Contact;
  services: Array<{ id: string; name: string }>;
  sources: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: (updatedContact: Contact) => void;
  userId: string;
}

export function ContactDetailModal({
  contact,
  services,
  sources,
  onClose,
  onSave,
  userId,
}: ContactDetailModalProps) {
  const [formData, setFormData] = useState(contact);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'estimateAmount') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value || undefined,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        leadId: contact.id,
      };

      // Only include non-empty values
      if (formData.contactName) payload.contactName = formData.contactName;
      if (formData.email) payload.email = formData.email;
      if (formData.phone) payload.phone = formData.phone;
      if (formData.service) payload.service = formData.service;
      if (formData.source) payload.source = formData.source;
      if (formData.estimateAmount) payload.estimateAmount = formData.estimateAmount;
      if (formData.estimateStatus) payload.estimateStatus = formData.estimateStatus;
      if (formData.closeStatus) payload.closeStatus = formData.closeStatus;
      if (formData.notes) payload.notes = formData.notes;

      console.log('Saving contact with payload:', payload);

      const response = await fetch('/api/leads/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(payload),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('API error:', data);
        throw new Error(data.error || 'Failed to update contact');
      }

      const responseData = await response.json();
      console.log('API response data:', responseData);

      const updatedLead = responseData.lead;
      console.log('Save successful, closing modal');
      onSave(updatedLead);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save contact';
      console.error('Save error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold">Edit Contact</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <p className="text-sm font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="contactName" className="font-semibold">
              Contact Name
            </Label>
            <Input
              id="contactName"
              name="contactName"
              type="text"
              placeholder="John Smith"
              value={formData.contactName || ''}
              onChange={handleChange}
              disabled={isSaving}
              className="text-base py-3"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email || ''}
              onChange={handleChange}
              disabled={isSaving}
              className="text-base py-3"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-semibold">
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone || ''}
              onChange={handleChange}
              disabled={isSaving}
              className="text-base py-3"
            />
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label htmlFor="service" className="font-semibold">
              Service
            </Label>
            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source" className="font-semibold">
              Lead Source
            </Label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sources.map((source) => (
                <option key={source.id} value={source.name}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estimate Amount */}
          <div className="space-y-2">
            <Label htmlFor="estimateAmount" className="font-semibold">
              Estimate Cost
            </Label>
            <Input
              id="estimateAmount"
              name="estimateAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="$1,500.00"
              value={formData.estimateAmount || ''}
              onChange={handleChange}
              disabled={isSaving}
              className="text-base py-3"
            />
          </div>

          {/* Estimate Status */}
          <div className="space-y-2">
            <Label htmlFor="estimateStatus" className="font-semibold">
              Estimate Status
            </Label>
            <select
              id="estimateStatus"
              name="estimateStatus"
              value={formData.estimateStatus}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PENDING">⏳ Pending</option>
              <option value="SCHEDULED">📅 Scheduled</option>
              <option value="COMPLETED">✓ Completed</option>
              <option value="NO_SHOW">✗ No Show</option>
            </select>
          </div>

          {/* Close Status */}
          <div className="space-y-2">
            <Label htmlFor="closeStatus" className="font-semibold">
              Close Status
            </Label>
            <select
              id="closeStatus"
              name="closeStatus"
              value={formData.closeStatus}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={
                formData.estimateStatus === 'PENDING' || formData.estimateStatus === 'SCHEDULED'
                  ? 'Complete or no-show the estimate before marking as won/lost'
                  : ''
              }
            >
              <option value="OPEN">🔵 Open</option>
              <option
                value="WON"
                disabled={formData.estimateStatus === 'PENDING' || formData.estimateStatus === 'SCHEDULED'}
              >
                ✓ Won
              </option>
              <option
                value="LOST"
                disabled={formData.estimateStatus === 'PENDING' || formData.estimateStatus === 'SCHEDULED'}
              >
                ✗ Lost
              </option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-semibold">
              Notes
            </Label>
            <Input
              id="notes"
              name="notes"
              type="text"
              placeholder="Any additional notes..."
              value={formData.notes || ''}
              onChange={handleChange}
              disabled={isSaving}
              className="text-base py-3"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? 'Saving...' : '✓ Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
