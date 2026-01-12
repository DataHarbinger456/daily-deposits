'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  orgId: string;
}

interface ServicesListProps {
  services: Service[];
  orgId: string;
  userId: string;
  onRefresh: () => Promise<void>;
}

export function ServicesList({ services, orgId, userId, onRefresh }: ServicesListProps) {
  const [newServiceName, setNewServiceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newServiceName.trim()) {
      toast({
        title: 'Error',
        description: 'Service name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/services/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          userId,
          serviceName: newServiceName.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to create service');
      }

      toast({
        title: 'Success',
        description: 'Service created successfully',
      });

      setNewServiceName('');
      await onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create service',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(serviceId));

    try {
      const response = await fetch('/api/services/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          orgId,
          userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to delete service');
      }

      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });

      await onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete service',
        variant: 'destructive',
      });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(serviceId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-3">Services</h3>
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <span className="text-sm font-medium">{service.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteService(service.id)}
                disabled={deletingIds.has(service.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleCreateService} className="space-y-3 p-4 bg-blue-50 rounded-lg border">
        <label className="block text-sm font-medium">Add New Service</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g., Tree Trimming"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            disabled={isSubmitting}
            className="py-3 text-base"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !newServiceName.trim()}
            size="lg"
            className="whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </form>
    </div>
  );
}
