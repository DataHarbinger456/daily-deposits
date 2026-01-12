'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Source {
  id: string;
  name: string;
  orgId: string;
}

interface SourcesListProps {
  sources: Source[];
  orgId: string;
  userId: string;
  onRefresh: () => Promise<void>;
}

export function SourcesList({ sources, orgId, userId, onRefresh }: SourcesListProps) {
  const [newSourceName, setNewSourceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSourceName.trim()) {
      toast({
        title: 'Error',
        description: 'Source name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/sources/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          userId,
          sourceName: newSourceName.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to create source');
      }

      toast({
        title: 'Success',
        description: 'Source created successfully',
      });

      setNewSourceName('');
      await onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create source',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source?')) {
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(sourceId));

    try {
      const response = await fetch('/api/sources/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId,
          orgId,
          userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to delete source');
      }

      toast({
        title: 'Success',
        description: 'Source deleted successfully',
      });

      await onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete source',
        variant: 'destructive',
      });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(sourceId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-3">Lead Sources</h3>
        <div className="space-y-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <span className="text-sm font-medium">{source.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSource(source.id)}
                disabled={deletingIds.has(source.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleCreateSource} className="space-y-3 p-4 bg-blue-50 rounded-lg border">
        <label className="block text-sm font-medium">Add New Lead Source</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g., Google Ads"
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            disabled={isSubmitting}
            className="py-3 text-base"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !newSourceName.trim()}
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
