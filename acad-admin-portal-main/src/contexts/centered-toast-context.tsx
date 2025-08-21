import React, { createContext, useContext, ReactNode } from 'react';
import { useCenteredToast } from '@/hooks/use-centered-toast';
import { CenteredToast } from '@/components/ui/centered-toast';

interface CenteredToastContextType {
  showSuccess: (title: string, description?: string, duration?: number) => string;
  showError: (title: string, description?: string, duration?: number) => string;
  showInfo: (title: string, description?: string, duration?: number) => string;
  showDefault: (title: string, description?: string, duration?: number) => string;
}

const CenteredToastContext = createContext<CenteredToastContextType | undefined>(undefined);

interface CenteredToastProviderProps {
  children: ReactNode;
}

export const CenteredToastProvider: React.FC<CenteredToastProviderProps> = ({ children }) => {
  const toastMethods = useCenteredToast();

  return (
    <CenteredToastContext.Provider value={toastMethods}>
      {children}
      {/* Render toasts */}
      {toastMethods.toasts.map((toast) => (
        <CenteredToast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          duration={toast.duration}
          onClose={toastMethods.removeToast}
        />
      ))}
    </CenteredToastContext.Provider>
  );
};

export const useCenteredToastContext = (): CenteredToastContextType => {
  const context = useContext(CenteredToastContext);
  if (context === undefined) {
    throw new Error('useCenteredToastContext must be used within a CenteredToastProvider');
  }
  return context;
};

export default CenteredToastProvider;
