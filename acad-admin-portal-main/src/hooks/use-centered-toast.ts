import { useState, useCallback } from 'react';

interface CenteredToast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'info';
  duration?: number;
}

export const useCenteredToast = () => {
  const [toasts, setToasts] = useState<CenteredToast[]>([]);

  const addToast = useCallback((toast: Omit<CenteredToast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, description?: string, duration = 10000) => {
    return addToast({ title, description, variant: 'success', duration });
  }, [addToast]);

  const showError = useCallback((title: string, description?: string, duration = 10000) => {
    return addToast({ title, description, variant: 'error', duration });
  }, [addToast]);

  const showInfo = useCallback((title: string, description?: string, duration = 10000) => {
    return addToast({ title, description, variant: 'info', duration });
  }, [addToast]);

  const showDefault = useCallback((title: string, description?: string, duration = 10000) => {
    return addToast({ title, description, variant: 'default', duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showDefault
  };
};

export default useCenteredToast;
