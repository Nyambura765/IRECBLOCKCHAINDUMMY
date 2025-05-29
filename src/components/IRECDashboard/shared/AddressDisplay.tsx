// components/IrecDashboard/Shared/AddressDisplay.tsx
import { Copy } from 'lucide-react';
import { useState } from 'react';

interface AddressDisplayProps {
  address: string;
  startLength?: number;
  endLength?: number;
  showCopy?: boolean;
  className?: string;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  startLength = 6,
  endLength = 4,
  showCopy = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const formatAddress = () => {
    if (!address) return '';
    if (address.length <= startLength + endLength) return address;
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
        {formatAddress()}
      </span>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          <Copy className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};