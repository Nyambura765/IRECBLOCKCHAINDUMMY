
import type { ReactNode } from 'react';
import { Database, RefreshCw, FolderOpen, Coins, Users, Settings } from 'lucide-react';
import { TabButton } from './shared/TabButton';

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
  userPermissions: {
    address: string | null;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isInitialSuperAdmin: boolean;
  };
  onRefresh: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  children,
  userPermissions,
  onRefresh,
  activeTab = 'overview',
  onTabChange,
}) => {
  function formatAddress(address: string): ReactNode {
    if (!address) return null;
    // Shorten the address: e.g., 0x1234...abcd
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {userPermissions.address && (
            <p className="text-sm text-gray-600 mt-1">
              Connected: {formatAddress(userPermissions.address)}
              {userPermissions.isSuperAdmin && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Super Admin
                </span>
              )}
              {userPermissions.isAdmin && !userPermissions.isSuperAdmin && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Admin
                </span>
              )}
            </p>
          )}
        </div>
        <button onClick={onRefresh} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-t-lg">
        <nav className="flex space-x-1 px-6">
          <TabButton
            icon={Database}
            active={activeTab === 'overview'}
            onClick={() => onTabChange?.('overview')}
          >
            Overview
          </TabButton>
          
          <TabButton
            icon={FolderOpen}
            active={activeTab === 'projects'}
            onClick={() => onTabChange?.('projects')}
          >
            Projects
          </TabButton>
          
          <TabButton
            icon={Coins}
            active={activeTab === 'irecs'}
            onClick={() => onTabChange?.('irecs')}
          >
            IRECs
          </TabButton>
          
          <TabButton
            icon={Users}
            active={activeTab === 'admins'}
            onClick={() => onTabChange?.('admins')}
          >
            Admins
          </TabButton>
          
          <TabButton
            icon={Settings}
            active={activeTab === 'settings'}
            onClick={() => onTabChange?.('settings')}
          >
            Settings
          </TabButton>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-lg shadow-md">
        {children}
      </div>
    </div>
  );
};