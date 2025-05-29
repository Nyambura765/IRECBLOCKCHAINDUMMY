// components/IrecDashboard/Shared/EmptyState.tsx
import {  Database, Award, Users, Settings } from 'lucide-react';

type EmptyStateType = 'data' | 'project' | 'irec' | 'admin' | 'settings';

interface EmptyStateProps {
  type: EmptyStateType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  action,
  className = '',
}) => {
  const iconMap = {
    data: <Database className="h-10 w-10 text-gray-400" />,
    project: <Award className="h-10 w-10 text-gray-400" />,
    irec: <Award className="h-10 w-10 text-gray-400" />,
    admin: <Users className="h-10 w-10 text-gray-400" />,
    settings: <Settings className="h-10 w-10 text-gray-400" />,
  };

  return (
    <div className={`text-center p-8 ${className}`}>
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-50">
        {iconMap[type]}
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};