import React, { useState } from 'react';
import { AddAdminForm } from './AddAdminForm';
import { AdminList } from './AdminList';
import { useAdminManagement } from '../AdminManagement/useAdminManagement';
import { ROLE_TYPES } from './types';
import type { AdminInfo } from '../types'; 

interface FormData {
  address: string;
  role: string;
  name: string;
}

export const AdminManagement: React.FC = () => {
  const {
    admins,
    userPermissions,
    loading,
    error,
    success,
    grantRole,
    revokeRole,
    refreshData,
    clearMessages
  } = useAdminManagement();

  const [formData, setFormData] = useState<FormData>({
    address: '',
    role: ROLE_TYPES.ADMIN_ROLE,
    name: '',
  });

  /**
   * Handle role granting from the form
   */
  const handleGrantRole = async (role: string) => {
    await grantRole(formData.address, role as keyof typeof ROLE_TYPES, formData.name);
    
    // Reset form on successful grant
    if (!error) {
      setFormData({
        address: '',
        role: ROLE_TYPES.ADMIN_ROLE,
        name: '',
      });
    }
  };

  /**
   * Handle role revocation from the admin list
   */
  const handleRevokeRole = async (address: string, isRevokingSuper: boolean) => {
    await revokeRole(address, isRevokingSuper);
  };

  /**
   * Format address for display
   */
  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  /**
   * Get admin statistics
   */
  const getAdminStats = () => {
    const totalAdmins = admins.length;
    const superAdmins = admins.filter(a => a.isSuperAdmin).length;
    const regularAdmins = admins.filter(a => a.isAdmin && !a.isSuperAdmin).length;
    const initialSuperAdmin = admins.find(a => a.isInitialSuperAdmin);

    return {
      totalAdmins,
      superAdmins,
      regularAdmins,
      initialSuperAdmin: initialSuperAdmin?.address || null
    };
  };

  const stats = getAdminStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage admin roles and permissions for the platform
            </p>
          </div>
          <button 
            onClick={refreshData}
            disabled={loading.loadingAdmins}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.loadingAdmins ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{stats.totalAdmins}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Admins</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalAdmins}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{stats.superAdmins}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Super Admins</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.superAdmins}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{stats.regularAdmins}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Regular Admins</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.regularAdmins}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Initial Super Admin</dt>
                    <dd className="text-xs font-mono text-gray-900">
                      {stats.initialSuperAdmin ? formatAddress(stats.initialSuperAdmin) : 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
              <div className="ml-auto pl-3">
                <button 
                  onClick={clearMessages}
                  className="inline-flex text-green-400 hover:text-green-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button 
                  onClick={clearMessages}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current User Permissions Card */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-700 mb-2">Your Current Permissions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">Address:</span>
              <span className="font-mono text-green-600">
                {userPermissions.address ? formatAddress(userPermissions.address) : 'Not connected'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-700">Admin:</span>
              <span className={`font-medium ${userPermissions.isAdmin ? 'text-green-600' : 'text-red-600'}`}>
                {userPermissions.isAdmin ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-700">Super Admin:</span>
              <span className={`font-medium ${userPermissions.isSuperAdmin ? 'text-green-600' : 'text-red-600'}`}>
                {userPermissions.isSuperAdmin ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-700">Initial Super Admin:</span>
              <span className={`font-medium ${userPermissions.isInitialSuperAdmin ? 'text-green-600' : 'text-red-600'}`}>
                {userPermissions.isInitialSuperAdmin ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-700">Can Grant Admin:</span>
              <span className={`font-medium ${userPermissions.canGrantAdmin ? 'text-green-600' : 'text-red-600'}`}>
                {userPermissions.canGrantAdmin ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-700">Can Grant Super Admin:</span>
              <span className={`font-medium ${userPermissions.canGrantSuperAdmin ? 'text-green-600' : 'text-red-600'}`}>
                {userPermissions.canGrantSuperAdmin ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Admin Form */}
          {(userPermissions.canGrantAdmin || userPermissions.canGrantSuperAdmin) && (
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <AddAdminForm
                    formData={formData}
                    onFormChange={setFormData}
                    onGrantRole={handleGrantRole}
                    loading={loading}
                    userPermissions={userPermissions}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Admin List */}
          <div className={`${(userPermissions.canGrantAdmin || userPermissions.canGrantSuperAdmin) ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Admin List
                </h3>
                
                {loading.loadingAdmins ? (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Loading admins...</p>
                  </div>
                ) : (
                  <AdminList
                    admins={admins as AdminInfo[]}
                    userPermissions={userPermissions}
                    loading={loading}
                    onRevokeRole={handleRevokeRole}
                    formatAddress={formatAddress}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};