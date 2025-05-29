// components/IrecDashboard/Shared/StatCard.tsx
import type { ReactNode } from 'react';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  change: number; // Percentage change (positive or negative)
  loading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  change,
  loading = false,
  trend,
  className = '',
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="h-4 w-4" />;
    if (trend === 'down') return <ArrowDown className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? (
              <div className="animate-pulse bg-gray-300 h-8 w-16 rounded" />
            ) : (
              value
            )}
          </p>
        </div>
        <div className="p-2 rounded-full bg-gray-100">{icon}</div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${getTrendColor()} flex items-center`}>
          {getTrendIcon()}
          {Math.abs(change)}%
        </span>
        <span className="text-sm text-gray-500 ml-1">vs last period</span>
      </div>
    </div>
  );
};