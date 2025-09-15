import React from 'react';
import { CenteredToast } from './centered-toast';
import { useCenteredToast } from '@/hooks/use-centered-toast';

interface CenteredToastProviderProps {
  children: React.ReactNode;
}

export const CenteredToastProvider: React.FC<CenteredToastProviderProps> = ({ children }) => {
  const { toasts, removeToast } = useCenteredToast();

  return (
    <>
      {children}
      {toasts.map((toast) => (
        <CenteredToast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </>
  );
};

export default CenteredToastProvider;
