// components/IrecDashboard/Shared/Toast.tsx
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  show,
  message,
  type,
  onClose,
  autoClose = true,
  autoCloseDuration = 4000,
}) => {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(onClose, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, autoCloseDuration, onClose]);

  if (!show) return null;

  const iconMap = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const bgColorMap = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed top-4 right-4 ${bgColorMap[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 min-w-[300px] max-w-md`}>
      {iconMap[type]}
      <span className="text-sm flex-1">{message}</span>
      <button onClick={onClose} className="hover:bg-white/10 rounded-full p-1">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};