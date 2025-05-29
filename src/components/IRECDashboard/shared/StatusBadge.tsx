// components/IrecDashboard/Shared/StatusBadge.tsx
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

type StatusType = 'success' | 'error' | 'warning' | 'pending' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  text: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  className = '',
}) => {
  const statusConfig = {
    success: {
      icon: <CheckCircle className="h-4 w-4" />,
      bg: 'bg-green-100',
      text: 'text-green-800',
    },
    error: {
      icon: <XCircle className="h-4 w-4" />,
      bg: 'bg-red-100',
      text: 'text-red-800',
    },
    warning: {
      icon: <AlertCircle className="h-4 w-4" />,
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
    },
    pending: {
      icon: <Clock className="h-4 w-4" />,
      bg: 'bg-blue-100',
      text: 'text-blue-800',
    },
    info: {
      icon: <AlertCircle className="h-4 w-4" />,
      bg: 'bg-gray-100',
      text: 'text-gray-800',
    },
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status].bg} ${statusConfig[status].text} ${className}`}
    >
      {statusConfig[status].icon}
      <span className="ml-1">{text}</span>
    </span>
  );
};