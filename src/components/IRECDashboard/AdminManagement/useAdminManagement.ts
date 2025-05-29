import { useState, useEffect, useCallback } from 'react';
import {
  grantAdminRole,
  grantSuperAdminRole,
  revokeAdminRole,
  revokeSuperAdminRole,
  getAllAdminInfo,
  getRoleGrantingPermissions,
  getCurrentUserPermissions
} from '../../../BlockchainServices/irecPlatformHooks';
import type { 
  AdminInfo, 
  UserPermissions, 
  LoadingState, 
  UseAdminManagementReturn,
  RoleType
} from './types';
import { ROLE_TYPES } from './types';

/**
 * Custom hook for managing admin operations
 * Handles all the state management and blockchain interactions
 */
export const useAdminManagement = (): UseAdminManagementReturn => {
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    address: null,
    isAdmin: false,
    isSuperAdmin: false,
    isInitialSuperAdmin: false,
    canGrantAdmin: false,
    canGrantSuperAdmin: false,
  });
  
  const [loading, setLoading] = useState<LoadingState>({
    grantingRole: new Set(),
    revokingRole: new Set(),
    loadingAdmins: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Load all admin data and user permissions
   */
  const refreshData = useCallback(async () => {
    setLoading(prev => ({ ...prev, loadingAdmins: true }));
    setError(null);

    try {
      const [adminData, userPerms, rolePerms] = await Promise.all([
        getAllAdminInfo(),
        getCurrentUserPermissions(),
        getRoleGrantingPermissions()
      ]);

      // Merge admin data with names - check if name exists, otherwise generate one
      const adminsWithNames = adminData.map(admin => ({
        ...admin,
        name: (admin as AdminInfo).name || `Admin ${admin.address.slice(0, 6)}...${admin.address.slice(-4)}`
      }));

      setAdmins(adminsWithNames);
      setUserPermissions({
        address: userPerms.address,
        isAdmin: userPerms.isAdmin,
        isSuperAdmin: userPerms.isSuperAdmin,
        isInitialSuperAdmin: userPerms.isInitialSuperAdmin,
        canGrantAdmin: rolePerms.canGrantAdmin,
        canGrantSuperAdmin: rolePerms.canGrantSuperAdmin,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load admin data';
      setError(errorMessage);
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(prev => ({ ...prev, loadingAdmins: false }));
    }
  }, []);

  /**
   * Grant a role to an address
   */
  const grantRole = useCallback(async (
    address: string, 
    role: RoleType, 
    name: string
  ): Promise<void> => {
    const targetAddress = address as `0x${string}`;
    
    // Validation
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError('Invalid Ethereum address format');
      return;
    }

    if (!name || name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    // Permission checks
    if (role === ROLE_TYPES.DEFAULT_ADMIN_ROLE && !userPermissions.canGrantSuperAdmin) {
      setError('You do not have permission to grant super admin roles');
      return;
    }

    if (role === ROLE_TYPES.ADMIN_ROLE && !userPermissions.canGrantAdmin) {
      setError('You do not have permission to grant admin roles');
      return;
    }

    // Check if already granting to this address
    if (loading.grantingRole.has(address)) {
      return;
    }

    setLoading(prev => ({
      ...prev,
      grantingRole: new Set([...prev.grantingRole, address])
    }));
    setError(null);

    try {
      let result;
      
      if (role === ROLE_TYPES.DEFAULT_ADMIN_ROLE) {
        result = await grantSuperAdminRole(targetAddress);
      } else {
        result = await grantAdminRole(targetAddress);
      }

      if (result.success) {
        const roleDisplayName = role === ROLE_TYPES.DEFAULT_ADMIN_ROLE ? 'super admin' : 'admin';
        setSuccess(`Successfully granted ${roleDisplayName} role to ${name}`);
        
        // Refresh data to show updated admin list
        await refreshData();
      } else {
        setError(result.error || 'Failed to grant role');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to grant role';
      setError(errorMessage);
      console.error('Error granting role:', err);
    } finally {
      setLoading(prev => ({
        ...prev,
        grantingRole: new Set([...prev.grantingRole].filter(addr => addr !== address))
      }));
    }
  }, [userPermissions, loading.grantingRole, refreshData]);

  /**
   * Revoke a role from an address
   */
  const revokeRole = useCallback(async (
    address: string, 
    isSuper: boolean
  ): Promise<void> => {
    const targetAddress = address as `0x${string}`;
    
    // Prevent self-revocation
    if (address.toLowerCase() === userPermissions.address?.toLowerCase()) {
      setError('You cannot revoke your own admin role');
      return;
    }

    // Check if already revoking this address
    if (loading.revokingRole.has(address)) {
      return;
    }

    setLoading(prev => ({
      ...prev,
      revokingRole: new Set([...prev.revokingRole, address])
    }));
    setError(null);

    try {
      let result;
      
      if (isSuper) {
        result = await revokeSuperAdminRole(targetAddress);
      } else {
        result = await revokeAdminRole(targetAddress);
      }

      if (result.success) {
        const roleDisplayName = isSuper ? 'super admin' : 'admin';
        setSuccess(`Successfully revoked ${roleDisplayName} role from ${address.slice(0, 6)}...${address.slice(-4)}`);
        
        // Refresh data to show updated admin list
        await refreshData();
      } else {
        setError(result.error || 'Failed to revoke role');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke role';
      setError(errorMessage);
      console.error('Error revoking role:', err);
    } finally {
      setLoading(prev => ({
        ...prev,
        revokingRole: new Set([...prev.revokingRole].filter(addr => addr !== address))
      }));
    }
  }, [userPermissions.address, loading.revokingRole, refreshData]);

  /**
   * Clear success and error messages
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, clearMessages]);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    admins,
    userPermissions,
    loading,
    error,
    success,
    grantRole,
    revokeRole,
    refreshData,
    clearMessages,
  };
};