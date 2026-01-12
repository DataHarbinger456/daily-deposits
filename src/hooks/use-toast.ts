import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (props: {
      title?: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { id, ...props };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  return { toast, toasts };
}
