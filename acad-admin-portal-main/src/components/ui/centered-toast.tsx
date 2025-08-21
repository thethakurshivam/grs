import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CenteredToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'info';
  duration?: number; // in milliseconds
  onClose: (id: string) => void;
}

const variantStyles = {
  default: 'bg-white border-gray-200 text-gray-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900'
};

const variantIcons = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  info: Info
};

const variantIconColors = {
  default: 'text-blue-600',
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600'
};

export const CenteredToast: React.FC<CenteredToastProps> = ({
  id,
  title,
  description,
  variant = 'default',
  duration = 10000, // 10 seconds default
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  useEffect(() => {
    // Auto-hide timer
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for fade out animation
    }, duration);

    // Countdown timer
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdown);
    };
  }, [duration, id, onClose]);

  const Icon = variantIcons[variant];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto">
        <div
          className={cn(
            'relative flex w-full max-w-md items-start space-x-4 overflow-hidden rounded-lg border p-6 shadow-lg transition-all duration-300',
            'animate-in slide-in-from-top-2 fade-in-0',
            variantStyles[variant]
          )}
        >
          {/* Icon */}
          <div className={cn('flex-shrink-0', variantIconColors[variant])}>
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            {title && (
              <h3 className="text-sm font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm leading-relaxed">
                {description}
              </p>
            )}
            
            {/* Countdown bar */}
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-current h-1 rounded-full transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${(timeLeft / (duration / 1000)) * 100}%`,
                  color: variant === 'success' ? '#059669' : 
                         variant === 'error' ? '#dc2626' : 
                         variant === 'info' ? '#2563eb' : '#6b7280'
                }}
              />
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(id), 300);
            }}
            className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CenteredToast;
