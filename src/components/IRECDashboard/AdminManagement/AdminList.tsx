import { ActionButton } from '../shared/ActionButton';
import { RefreshCw, Shield, ShieldCheck, Crown } from 'lucide-react';
import type { AdminInfo } from '../types';

interface AdminListProps {
  admins: AdminInfo[];
  userPermissions: {
    address: string | null;
    isSuperAdmin: boolean;
    isInitialSuperAdmin: boolean;
  };
  loading: {
    revokingRole: Set<string>;
    loadingAdmins?: boolean;
  };
  onRevokeRole: (address: string, isRevokingSuper: boolean) => void;
  onRefresh?: () => void;
  formatAddress: (addr: string) => string;
}

export const AdminList: React.FC<AdminListProps> = ({
  admins,
  userPermissions,
  loading,
  onRevokeRole,
  onRefresh,
  formatAddress,
}) => {
  
  const canRevokeRole = (admin: AdminInfo): boolean => {
    // Cannot revoke your own role
    if (admin.address.toLowerCase() === userPermissions.address?.toLowerCase()) {
      return false;
    }

    // Cannot revoke the initial super admin role
    if (admin.isInitialSuperAdmin) {
      return false;
    }

    // Only super admins can revoke admin roles
    if (admin.isAdmin && !admin.isSuperAdmin) {
      return userPermissions.isSuperAdmin;
    }

    // Only initial super admin can revoke super admin roles
    if (admin.isSuperAdmin) {
      return userPermissions.isInitialSuperAdmin;
    }

    return false;
  };

  const getRevokeButtonText = (admin: AdminInfo): string => {
    if (admin.isInitialSuperAdmin) {
      return 'Cannot Revoke';
    }
    
    if (admin.address.toLowerCase() === userPermissions.address?.toLowerCase()) {
      return 'Cannot Revoke Self';
    }

    if (admin.isSuperAdmin) {
      return 'Revoke Super Admin';
    }

    return 'Revoke Admin';
  };

  const getRevokeButtonVariant = (admin: AdminInfo): 'danger' | 'warning' | 'primary' => {
    if (!canRevokeRole(admin)) {
      return 'primary';
    }
    
    return admin.isSuperAdmin ? 'danger' : 'warning';
  };

  const getTooltipText = (admin: AdminInfo): string => {
    if (admin.isInitialSuperAdmin) {
      return 'The initial super admin role cannot be revoked';
    }
    
    if (admin.address.toLowerCase() === userPermissions.address?.toLowerCase()) {
      return 'You cannot revoke your own admin role';
    }

    if (admin.isSuperAdmin && !userPermissions.isInitialSuperAdmin) {
      return 'Only the initial super admin can revoke super admin roles';
    }

    if (admin.isAdmin && !userPermissions.isSuperAdmin) {
      return 'Only super admins can revoke admin roles';
    }

    return '';
  };

  const getRoleIcon = (admin: AdminInfo) => {
    if (admin.isInitialSuperAdmin) {
      return <Crown className="h-4 w-4 text-purple-600" />;
    } else if (admin.isSuperAdmin) {
      return <ShieldCheck className="h-4 w-4 text-red-600" />;
    } else {
      return <Shield className="h-4 w-4 text-green-600" />;
    }
  };

  const getStatusColor = (): string => {
    
    return 'bg-green-400';
  };

  if (loading.loadingAdmins) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-green-600" />
          <span className="text-gray-600">Loading admin data...</span>
        </div>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No admins found</p>
        <p className="text-gray-400 text-sm mb-4">
          Admin data might still be loading from the blockchain
        </p>
        {onRefresh && (
          <ActionButton 
            onClick={onRefresh}
            variant="primary"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Admin Data
          </ActionButton>
        )}
      </div>
    );
  }

  const totalAdmins = admins.length;
  const superAdmins = admins.filter(a => a.isSuperAdmin).length;
  const regularAdmins = admins.filter(a => a.isAdmin && !a.isSuperAdmin).length;
  const initialSuperAdmins = admins.filter(a => a.isInitialSuperAdmin).length;

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h4 className="text-lg font-medium text-gray-900">Admin List</h4>
          <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
            {totalAdmins} total
          </span>
        </div>
        {onRefresh && (
          <ActionButton 
            onClick={onRefresh}
            variant="primary"
            size="sm"
            loading={loading.loadingAdmins}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </ActionButton>
        )}
      </div>

      {/* Admin table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.address} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      {getRoleIcon(admin)}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {admin.name || `Admin ${formatAddress(admin.address)}`}
                      </div>
                      <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block max-w-fit">
                        {formatAddress(admin.address)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.isInitialSuperAdmin
                          ? 'bg-purple-100 text-purple-800'
                          : admin.isSuperAdmin
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {admin.isInitialSuperAdmin
                        ? 'Initial Super Admin'
                        : admin.isSuperAdmin
                        ? 'Super Admin'
                        : 'Admin'}
                    </span>
                    {admin.address.toLowerCase() === userPermissions.address?.toLowerCase() && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        You
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-2 h-2 ${getStatusColor()} rounded-full mr-2`}></div>
                    <span className="text-sm text-gray-900">Active</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {canRevokeRole(admin) ? (
                      <ActionButton 
                        onClick={() => onRevokeRole(admin.address, admin.isSuperAdmin)}
                        loading={loading.revokingRole.has(admin.address.toLowerCase())}
                        variant={getRevokeButtonVariant(admin)}
                        size="sm"
                      >
                        {loading.revokingRole.has(admin.address.toLowerCase()) 
                          ? 'Revoking...' 
                          : getRevokeButtonText(admin)
                        }
                      </ActionButton>
                    ) : (
                      <div className="relative group">
                        <ActionButton 
                          onClick={() => {}} 
                          disabled={true}
                          variant="primary"
                          size="sm"
                        >
                          {getRevokeButtonText(admin)}
                        </ActionButton>
                        {getTooltipText(admin) && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 max-w-xs">
                            {getTooltipText(admin)}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Enhanced Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
        <h5 className="text-sm font-semibold text-gray-700 mb-3">Admin Summary</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalAdmins}</div>
            <div className="text-xs text-gray-600">Total Admins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{initialSuperAdmins}</div>
            <div className="text-xs text-gray-600">Initial Super</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{superAdmins}</div>
            <div className="text-xs text-gray-600">Super Admins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{regularAdmins}</div>
            <div className="text-xs text-gray-600">Regular Admins</div>
          </div>
        </div>
        
        {/* Last updated info */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last updated: {new Date().toLocaleString()}</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              Real-time data from blockchain
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};