// components/IrecDashboard/Shared/TabButton.tsx
import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface TabButtonProps {
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({
  icon: Icon,
  active,
  onClick,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm ${
        active
          ? 'border-green-500 text-green-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </button>
  );
};