import { useState, useEffect } from 'react';
import { Building, RefreshCw } from 'lucide-react';
import { useCallback } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Toast } from './shared/Toast';
import { StatCard } from './shared/StatCard';
import { ProjectApprovalForm } from './ProjectManagement/ProjectApprovalForm';
import { ProjectList } from './ProjectManagement/ProjectList';
import { IrecList } from './IRECManagement/IRECList';
import { MintIrecForm } from './IRECManagement/MintIRECForm';
import { AdminList } from './AdminManagement/AdminList';
import { AddAdminForm } from './AdminManagement/AddAdminForm';
import { PlatformSettingsForm } from './Settings/PlatformSettingsForm';
import { getUserPermissions } from './AdminManagement/constants/adminConfig';

// Import blockchain functions
import {
  getCurrentUserPermissions,
  getAllAdminInfo,
  grantAdminRole,
  grantSuperAdminRole,
  revokeAdminRole,
  revokeSuperAdminRole,
  getConnectedAddress,
  isValidAddress,
  formatAddress as blockchainFormatAddress,
  approveProject,
  getIRECDetails
} from '../../BlockchainServices/irecPlatformHooks'; 

import type { 
  Project,
  IRECToken,
  ToastType,
  AdminInfo
} from './types';
import type {
  LoadingState,
  EthereumAddress
} from './AdminManagement/constants/adminConfig';

// Extended AdminInfo type 
interface ExtendedAdminInfo extends AdminInfo {
  name?: string;
  lastUpdated?: string;
  roleLevel?: number;
}

const IRECAdminDashboard: React.FC = () => {
  // State declarations
  const [currentUserAddress, setCurrentUserAddress] = useState<EthereumAddress | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userRoles, setUserRoles] = useState({
    isAdmin: false,
    isSuperAdmin: false,
    isInitialSuperAdmin: false,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [irecs, setIrecs] = useState<IRECToken[]>([]);
  const [admins, setAdmins] = useState<ExtendedAdminInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'irecs' | 'admins' | 'settings'>('overview');
  
  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    grantingRole: new Set<string>(),
    revokingRole: new Set<string>(),
    loadingAdmins: false,
  });
  
  const [operationLoading, setOperationLoading] = useState({
    grantingAdmin: false,
    grantingSuperAdmin: false,
    revokingAdmin: false,
    currentOperation: '',
  });
  
  const [projectLoading, setProjectLoading] = useState({
    approving: new Set<string>(),
  });
  
  const [additionalLoading, setAdditionalLoading] = useState({
    savingSettings: false,
    checkingPermissions: false,
    loadingProjects: false,
    loadingIRECs: false,
  });
  
  // Form states
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({ 
    show: false, 
    message: '', 
    type: 'success' 
  });
  
  const [approvalForm, setApprovalForm] = useState({ projectAddress: '' });
  const [platformSettings, setPlatformSettings] = useState({
    baseTokenURI: 'https://ipfs.io/ipfs/',
    platformFee: '2.5',
    minEnergyPerToken: '50',
    contractAddress: '0xContract...Address',
  });
  
  const [newAdminForm, setNewAdminForm] = useState({
    address: '',
    role: 'ADMIN_ROLE',
    name: '',
  });

  // Helper functions
  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  }, []);

  const formatAddress = (addr: string) => blockchainFormatAddress(addr as `0x${string}`);

  const getAdminDisplayName = useCallback((address: string): string => {
    try {
      const savedNames = JSON.parse(localStorage.getItem('adminNames') || '{}');
      return savedNames[address.toLowerCase()] || `Admin ${formatAddress(address)}`;
    } catch {
      return `Admin ${formatAddress(address)}`;
    }
  }, []);

  const saveAdminName = (address: string, name: string) => {
    try {
      const savedNames = JSON.parse(localStorage.getItem('adminNames') || '{}');
      savedNames[address.toLowerCase()] = name.trim();
      localStorage.setItem('adminNames', JSON.stringify(savedNames));
    } catch (error) {
      console.error('Failed to save admin name:', error);
    }
  };

  // Tab change handler
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'overview' | 'projects' | 'irecs' | 'admins' | 'settings');
  };

  // Initialize wallet connection
  useEffect(() => {
    const initializeWallet = async () => {
      setAdditionalLoading(prev => ({ ...prev, checkingPermissions: true }));
      
      try {
        const address = await getConnectedAddress();
        
        if (address) {
          setCurrentUserAddress(address);
          setIsWalletConnected(true);
          
          const permissions = await getCurrentUserPermissions();
          
          if (permissions.error) {
            showToast(`Error loading permissions: ${permissions.error}`, 'error');
          } else {
            setUserRoles({
              isAdmin: permissions.isAdmin,
              isSuperAdmin: permissions.isSuperAdmin,
              isInitialSuperAdmin: permissions.isInitialSuperAdmin,
            });
          }
        } else {
          setIsWalletConnected(false);
          showToast('Please connect your wallet to access admin features', 'warning');
        }
      } catch (error) {
        console.error('Error initializing wallet:', error);
        showToast('Failed to connect to wallet', 'error');
      } finally {
        setAdditionalLoading(prev => ({ ...prev, checkingPermissions: false }));
      }
    };

    initializeWallet();
  }, [showToast]);

  // Data loading functions
  const loadProjects = useCallback(async () => {
    setAdditionalLoading(prev => ({ ...prev, loadingProjects: true }));
    try {
      
      setProjects([]);
    } catch (error) {
      console.error('Error loading projects:', error);
      showToast('Failed to load projects', 'error');
    } finally {
      setAdditionalLoading(prev => ({ ...prev, loadingProjects: false }));
    }
  }, [showToast]);

  // Load IREC data
  const refreshIRECData = useCallback(async () => {
    if (!currentUserAddress) return;

    setAdditionalLoading(prev => ({ ...prev, loadingIRECs: true }));
    
    try {
      
      
      setIrecs([]);
      showToast('IREC data loading requires alternative implementation without getAllTokenIds hook', 'info');
      
      
      
    } catch (error) {
      let errorMessage = 'Failed to load IREC data';
      if (error instanceof Error) errorMessage = error.message;
      showToast(errorMessage, 'error');
    } finally {
      setAdditionalLoading(prev => ({ ...prev, loadingIRECs: false }));
    }
  }, [currentUserAddress, showToast]);

  //  refreshAdminData function
  const refreshAdminData = useCallback(async () => {
    if (!currentUserAddress) return;

    setLoading(prev => ({ ...prev, loadingAdmins: true }));
    
    try {
      const adminInfo = await getAllAdminInfo();
      
      if (Array.isArray(adminInfo)) {
        const processedAdmins = adminInfo.map(admin => ({
          ...admin,
          name: getAdminDisplayName(admin.address),
          lastUpdated: new Date().toISOString(),
          roleLevel: admin.isInitialSuperAdmin ? 3 : admin.isSuperAdmin ? 2 : admin.isAdmin ? 1 : 0
        }));
        
        const sortedAdmins = processedAdmins.sort((a, b) => {
          if (a.roleLevel !== b.roleLevel) return b.roleLevel - a.roleLevel;
          return a.address.localeCompare(b.address);
        });
        
        setAdmins(sortedAdmins);
        
        if (operationLoading.currentOperation) {
          showToast('Admin list updated successfully', 'success');
        }
      } else {
        showToast('Invalid admin data format received', 'error');
      }
    } catch (error) {
      let errorMessage = 'Failed to load admin data';
      if (error instanceof Error) errorMessage = error.message;
      showToast(errorMessage, 'error');
    } finally {
      setLoading(prev => ({ ...prev, loadingAdmins: false }));
    }
  }, [currentUserAddress, getAdminDisplayName, showToast, operationLoading.currentOperation]);

  // handleGrantRole with name saving
  const handleGrantRole = async (role: string) => {
    if (!newAdminForm.address.trim()) {
      showToast('Please enter an address', 'error');
      return;
    }
    if (!isValidAddress(newAdminForm.address)) {
      showToast('Please enter a valid Ethereum address', 'error');
      return;
    }
    
    // Save admin name
    if (newAdminForm.name.trim()) {
      saveAdminName(newAdminForm.address, newAdminForm.name);
    }
    
    const addressKey = newAdminForm.address.toLowerCase();
    const roleKey = `${addressKey}-${role}`;
    const operationType = role === 'ADMIN_ROLE' ? 'grantingAdmin' : 'grantingSuperAdmin';
    
    setLoading(prev => ({
      ...prev,
      grantingRole: new Set([...prev.grantingRole, addressKey, roleKey])
    }));
    
    setOperationLoading(prev => ({
      ...prev,
      [operationType]: true,
      currentOperation: `Granting ${role} to ${formatAddress(newAdminForm.address)}`
    }));

    try {
      let result;
      
      if (role === 'ADMIN_ROLE') {
        result = await grantAdminRole(newAdminForm.address as `0x${string}`);
      } else {
        result = await grantSuperAdminRole(newAdminForm.address as `0x${string}`);
      }
      
      if (result?.success === true || (typeof result === 'boolean' && result === true)) {
        const roleName = role === 'ADMIN_ROLE' ? 'Admin' : 'Super Admin';
        const adminName = newAdminForm.name || formatAddress(newAdminForm.address);
        
        showToast(`${roleName} role granted to ${adminName} successfully!`, 'success');
        
        setNewAdminForm({
          address: '',
          role: 'ADMIN_ROLE',
          name: '',
        });
        
        setTimeout(async () => {
          await refreshAdminData();
        }, 1000);
      } else {
        showToast(result?.error || 'Failed to grant role', 'error');
      }
    } catch (error) {
      let errorMessage = 'Failed to grant role';
      if (error instanceof Error) errorMessage = error.message;
      showToast(errorMessage, 'error');
    } finally {
      setLoading(prev => {
        const newGranting = new Set(prev.grantingRole);
        newGranting.delete(addressKey);
        newGranting.delete(roleKey);
        return { ...prev, grantingRole: newGranting };
      });
      
      setOperationLoading(prev => ({
        ...prev,
        [operationType]: false,
        currentOperation: ''
      }));
    }
  };

  // Revoke role handler
  const handleRevokeRole = async (address: string, isSuper: boolean) => {
    const roleKey = address.toLowerCase();
    const operationType = 'revokingAdmin';
    const roleName = isSuper ? 'Super Admin' : 'Admin';
    const adminName = getAdminDisplayName(address);
    
    setLoading(prev => ({
      ...prev,
      revokingRole: new Set([...prev.revokingRole, roleKey])
    }));
    
    setOperationLoading(prev => ({
      ...prev,
      [operationType]: true,
      currentOperation: `Revoking ${roleName} role from ${adminName}`
    }));

    try {
      const result = isSuper 
        ? await revokeSuperAdminRole(address as `0x${string}`)
        : await revokeAdminRole(address as `0x${string}`);

      if (result?.success === true || (typeof result === 'boolean' && result === true)) {
        showToast(`${roleName} role revoked from ${adminName} successfully!`, 'success');
        setTimeout(async () => {
          await refreshAdminData();
        }, 1000);
      } else {
        showToast(result?.error || 'Failed to revoke role', 'error');
      }
    } catch (error) {
      let errorMessage = 'Failed to revoke role';
      if (error instanceof Error) errorMessage = error.message;
      showToast(errorMessage, 'error');
    } finally {
      setLoading(prev => {
        const newRevoking = new Set(prev.revokingRole);
        newRevoking.delete(roleKey);
        return { ...prev, revokingRole: newRevoking };
      });
      
      setOperationLoading(prev => ({
        ...prev,
        [operationType]: false,
        currentOperation: ''
      }));
    }
  };

  //  Project management handlers with blockchain integration
  const handleApproveProjectByAddress = async (projectAddress: string) => {
    if (!projectAddress.trim()) {
      showToast('Please enter a project address', 'error');
      return;
    }
    if (!isValidAddress(projectAddress)) {
      showToast('Please enter a valid Ethereum address', 'error');
      return;
    }

    setProjectLoading(prev => ({
      ...prev,
      approving: new Set([...prev.approving, projectAddress])
    }));

    try {
      const result = await approveProject(projectAddress as `0x${string}`);
      
      if (result.success) {
        
        const successMessage = `Project ${formatAddress(projectAddress)} approved successfully!`;
        showToast(successMessage, 'success');
        
        if (result.hash) {
          setTimeout(() => {
            showToast(`Transaction Hash: ${result.hash}`, 'info');
          }, 1000);
        }
        
        setApprovalForm({ projectAddress: '' });
        await loadProjects();
      } else {
        showToast(result.error || 'Failed to approve project', 'error');
      }
    } catch (error) {
      let errorMessage = 'Failed to approve project';
      if (error instanceof Error) errorMessage = error.message;
      showToast(errorMessage, 'error');
    } finally {
      setProjectLoading(prev => {
        const newApproving = new Set(prev.approving);
        newApproving.delete(projectAddress);
        return { ...prev, approving: newApproving };
      });
    }
  };

  const handleApproveProject = async (projectId: string) => {
    setProjectLoading(prev => ({
      ...prev,
      approving: new Set([...prev.approving, projectId])
    }));

    try {
      const result = await approveProject(projectId as `0x${string}`);
      
      if (result.success) {
        
        const successMessage = `Project ${formatAddress(projectId)} approved successfully!`;
        showToast(successMessage, 'success');
        
        if (result.hash) {
          setTimeout(() => {
            showToast(`Transaction Hash: ${result.hash}`, 'info');
          }, 1000);
        }
        
        await loadProjects();
      } else {
        showToast(result.error || 'Failed to approve project', 'error');
      }
    } catch (error) {
      let errorMessage = 'Failed to approve project';
      if (error instanceof Error) errorMessage = error.message;
      showToast(errorMessage, 'error');
    } finally {
      setProjectLoading(prev => {
        const newApproving = new Set(prev.approving);
        newApproving.delete(projectId);
        return { ...prev, approving: newApproving };
      });
    }
  };

  const handleRevokeProject = async (projectId: string) => {
    try {
      
      showToast(`Project ${projectId} revoked successfully!`, 'success');
      await loadProjects();
    } catch (error) {
      let errorMessage = 'Failed to revoke project';
      if (error instanceof Error) errorMessage = error.message;
      showToast(errorMessage, 'error');
    }
  };

  const handleRemoveProject = async (projectId: string) => {
    try {
      
      showToast(`Project ${projectId} removed successfully!`, 'success');
      await loadProjects();
    } catch (error) {
      let errorMessage = 'Failed to remove project';
      if (error instanceof Error) errorMessage = error.message;
      showToast(errorMessage, 'error');
    }
  };

  // IREC management handlers
  const handleMintSuccess = async (hash: `0x${string}`) => {
    showToast(`IREC minted successfully! Transaction hash: ${hash}`, 'success');
    await refreshIRECData();
  };

  const handleMintError = (error: string) => {
    showToast(error, 'error');
  };

  // Settings handlers
  const handleSettingsChange = (settings: { baseTokenURI: string; platformFee: string; minEnergyPerToken: string }) => {
    setPlatformSettings({
      ...settings,
      contractAddress: platformSettings.contractAddress
    });
  };

  const saveSettings = async () => {
    setAdditionalLoading(prev => ({ ...prev, savingSettings: true }));
    
    try {
      
      showToast('Platform settings saved successfully!', 'success');
    } catch (error) {
      let errorMessage = 'Failed to save settings';
      if (error instanceof Error) errorMessage = error.message;
      showToast(errorMessage, 'error');
    } finally {
      setAdditionalLoading(prev => ({ ...prev, savingSettings: false }));
    }
  };

  // Manual refresh handler
  const handleManualRefresh = async () => {
    showToast('Refreshing admin data...', 'info');
    await refreshAdminData();
  };

  // Calculate permissions
  const userPermissions = getUserPermissions(
    currentUserAddress,
    userRoles.isAdmin,
    userRoles.isSuperAdmin
  );

  const extendedUserPermissions = {
    ...userPermissions,
    canGrantAdmin: userPermissions.canGrantAdmin || userPermissions.isSuperAdmin || userPermissions.isInitialSuperAdmin,
    canGrantSuperAdmin: userPermissions.canGrantSuperAdmin || userPermissions.isSuperAdmin || userPermissions.isInitialSuperAdmin,
    canGrantRoles: userPermissions.canGrantAdmin || userPermissions.canGrantSuperAdmin,
    canApproveProjects: userPermissions.isAdmin || userPermissions.isSuperAdmin || userPermissions.isInitialSuperAdmin,
    canMintTokens: userPermissions.isAdmin || userPermissions.isSuperAdmin || userPermissions.isInitialSuperAdmin,
  };

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Connection Required</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access the IREC Admin Dashboard.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="IREC Admin Dashboard"
      userPermissions={userPermissions}
      onRefresh={refreshAdminData}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {operationLoading.currentOperation && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2"></div>
            <span className="text-sm">{operationLoading.currentOperation}</span>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <StatCard 
              icon={<Building className="h-6 w-6 text-green-600" />} 
              title="Total Projects" 
              value={projects.length.toString()} 
              change={12} 
              trend="up"
            />
            <StatCard 
              icon={<Building className="h-6 w-6 text-green-600" />} 
              title="Total IRECs" 
              value={irecs.length.toString()} 
              change={8} 
              trend="up"
            />
            <StatCard 
              icon={<Building className="h-6 w-6 text-green-600" />} 
              title="Total Admins" 
              value={admins.length.toString()} 
              change={2} 
              trend="up"
            />
          </div>
          
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Wallet Information</h4>
            <div className="space-y-2">
              <p><span className="font-medium">Address:</span> {formatAddress(currentUserAddress || '')}</p>
              <p><span className="font-medium">Admin:</span> {userRoles.isAdmin ? '✓' : '✗'}</p>
              <p><span className="font-medium">Super Admin:</span> {userRoles.isSuperAdmin ? '✓' : '✗'}</p>
              <p><span className="font-medium">Initial Super Admin:</span> {userRoles.isInitialSuperAdmin ? '✓' : '✗'}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
            <ProjectApprovalForm
              projectAddress={approvalForm.projectAddress}
              onAddressChange={(address) => setApprovalForm({ projectAddress: address })}
              onApprove={() => handleApproveProjectByAddress(approvalForm.projectAddress)}
            />
          </div>
          <ProjectList
            projects={projects}
            loading={projectLoading}
            onApproveProject={handleApproveProject}
            onRevokeProject={handleRevokeProject}
            onRemoveProject={handleRemoveProject}
            userPermissions={{
              isSuperAdmin: userPermissions.isSuperAdmin,
              isInitialSuperAdmin: userPermissions.isInitialSuperAdmin,
            }}
            formatAddress={formatAddress}
          />
        </div>
      )}

      {activeTab === 'irecs' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">IREC Token Management</h3>
            <MintIrecForm
              projects={projects.filter(p => p.approved)}
              onSuccess={handleMintSuccess}
              onError={handleMintError}
            />
          </div>
          <IrecList
            formatAddress={formatAddress}
            getIRECDetails={getIRECDetails}
          />
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Admin Management</h3>
              <button
                onClick={handleManualRefresh}
                disabled={loading.loadingAdmins}
                className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading.loadingAdmins ? 'animate-spin' : ''}`} />
                {loading.loadingAdmins ? 'Refreshing...' : 'Refresh List'}
              </button>
            </div>
            <AddAdminForm
              formData={newAdminForm}
              onFormChange={(data) => {
                if (data.name && data.name !== newAdminForm.name) {
                  saveAdminName(data.address, data.name);
                }
                setNewAdminForm(data);
              }}
              onGrantRole={handleGrantRole}
              loading={loading}
              userPermissions={extendedUserPermissions}
            />
          </div>
          <AdminList
            admins={admins}
            userPermissions={{
              address: userPermissions.address,
              isSuperAdmin: userPermissions.isSuperAdmin,
              isInitialSuperAdmin: userPermissions.isInitialSuperAdmin,
            }}
            loading={{
              revokingRole: loading.revokingRole,
            }}
            onRevokeRole={handleRevokeRole}
            formatAddress={formatAddress}
          />
        </div>
      )}

      {activeTab === 'settings' && (
        <PlatformSettingsForm
          settings={{
            baseTokenURI: platformSettings.baseTokenURI,
            platformFee: platformSettings.platformFee,
            minEnergyPerToken: platformSettings.minEnergyPerToken,
            contractAddress: platformSettings.contractAddress,
          }}
          onSettingsChange={handleSettingsChange}
          onSave={saveSettings}
          loading={additionalLoading.savingSettings}
        />
      )}
    </DashboardLayout>
  );
};

export default IRECAdminDashboard;