// components/IrecDashboard/Shared/ActionButton.tsx
import { RefreshCw } from 'lucide-react';
import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  children,
  variant = 'primary',
  size = 'md',
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
  
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const variantClasses: Record<string, string> = {
    primary: 'bg-green-600 text-white hover:bg-green-600 focus:ring-green-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {loading ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};