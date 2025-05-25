import React, { useState, useEffect } from 'react';
import {
  Building,
  CheckCircle,
  XCircle,
  DollarSign,
  Settings,
  Users,
  Award,
  Key,
  Shield,
  Database,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  approveProject,
  grantAdminRole,
  grantSuperAdminRole,
  revokeAdminRole,
  revokeSuperAdminRole,
  getCurrentUserPermissions,
  getAllAdminInfo,
  getAdminCount,
  getSuperAdminCount,
  isValidAddress,
  formatAddress,
} from '../BlockchainServices/irecPlatformHooks';

// Types
interface Project {
  address: string;
  approved: boolean;
  name: string;
  description: string;
  energyGenerated?: number;
  lastActivity?: string;
}
interface IRECToken {
  tokenId: number;
  owner: string;
  projectAddress: string;
  projectName: string;
  metadataURI: string;
  mintedAt: string;
  energyAmount?: number;
}
interface AdminUser {
  address: `0x${string}`;
  role: 'ADMIN_ROLE' | 'DEFAULT_ADMIN_ROLE' | 'OWNER';
  name?: string;
  addedAt?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}
interface LoadingState {
  approving: string | null;
  grantingRole: string | null;
  revokingRole: string | null;
  loadingAdmins: boolean;
  checkingPermissions: boolean;
}
interface UserPermissions {
  address: `0x${string}` | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canGrantRoles: boolean;
  canApproveProjects: boolean;
  canMintTokens: boolean;
}

// Mock data
const mockProjects: Project[] = [
  {
    address: '0x123abc000000000000000000000000000000def456',
    approved: true,
    name: 'Green Solar Farm',
    description: 'Large scale solar installation in California with 500MW capacity',
    energyGenerated: 1500,
    lastActivity: '2024-01-15'
  },
  {
    address: '0x456def000000000000000000000000000000abc123',
    approved: false,
    name: 'Wind Power Co',
    description: 'Offshore wind turbines generating clean energy for coastal cities',
    energyGenerated: 2300,
    lastActivity: '2024-01-20'
  }
];
const mockIRECs: IRECToken[] = [
  {
    tokenId: 1,
    owner: '0x123abc000000000000000000000000000000def456',
    projectAddress: '0x123abc000000000000000000000000000000def456',
    projectName: 'Green Solar Farm',
    metadataURI: 'https://ipfs.io/ipfs/Qm...abc123  ',
    mintedAt: '2024-01-10',
    energyAmount: 500
  }
];

// Toast Component
const Toast: React.FC<{
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}> = ({ show, message, type, onClose }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  if (!show) return null;
  const bgColor =
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
        ? 'bg-red-500'
        : type === 'warning'
          ? 'bg-yellow-500'
          : 'bg-blue-500';
  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2`}
    >
      {type === 'success' && <CheckCircle className="h-5 w-5" />}
      {type === 'error' && <XCircle className="h-5 w-5" />}
      {type === 'warning' && <AlertCircle className="h-5 w-5" />}
      <span className="text-sm">{message}</span>
    </div>
  );
};

// StatCard Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  color?: string;
  loading?: boolean;
}> = ({ icon, title, value, change, color = 'blue', loading = false }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {loading ? (
            <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
          ) : (
            value
          )}
        </p>
      </div>
      <div className={`text-${color}-600`}>{icon}</div>
    </div>
    <div className="mt-4">
      <span className={`text-sm font-medium text-${color}-600`}>{change}</span>
      <span className="text-sm text-gray-500 ml-1">vs last month</span>
    </div>
  </div>
);

// Main Admin Dashboard Component
const IRECAdminDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [irecs, setIRECs] = useState<IRECToken[]>(mockIRECs);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'irecs' | 'admins' | 'settings'>('overview');
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    address: null,
    isAdmin: false,
    isSuperAdmin: false,
    canGrantRoles: false,
    canApproveProjects: false,
    canMintTokens: false
  });
  const [adminStats, setAdminStats] = useState({
    totalAdmins: 0,
    totalSuperAdmins: 0
  });
  const [loading, setLoading] = useState<LoadingState>({
    approving: null,
    grantingRole: null,
    revokingRole: null,
    loadingAdmins: false,
    checkingPermissions: true
  });
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [approvalForm, setApprovalForm] = useState({
    projectAddress: ''
  });
  const [platformSettings, setPlatformSettings] = useState({
    baseTokenURI: 'https://ipfs.io/ipfs/ ',
    platformFee: '2.5',
    minEnergyPerToken: '50',
    contractAddress: '0xContract...Address'
  });
  const [mintForm, setMintForm] = useState({
    projectAddress: '',
    metadataURI: '',
    energyAmount: ''
  });
  const [newAdminForm, setNewAdminForm] = useState({
    address: '',
    role: 'ADMIN_ROLE' as 'ADMIN_ROLE' | 'DEFAULT_ADMIN_ROLE',
    name: ''
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
  };

  const loadUserPermissions = React.useCallback(async () => {
    setLoading(prev => ({ ...prev, checkingPermissions: true }));
    try {
      const permissions = await getCurrentUserPermissions();
      if (permissions.error) {
        showToast(`Permission check failed: ${permissions.error}`, 'warning');
        return;
      }

      const [canGrant, canApprove, canMint] = await Promise.all([
        canPerformAction(),
        canPerformAction(),
        canPerformAction()
      ]);

      setUserPermissions({
        address: permissions.address,
        isAdmin: permissions.isAdmin,
        isSuperAdmin: permissions.isSuperAdmin,
        canGrantRoles: canGrant,
        canApproveProjects: canApprove,
        canMintTokens: canMint
      });

      if (permissions.address) {
        if (permissions.isSuperAdmin) {
          showToast('Connected as Super Admin with full privileges', 'success');
        } else if (permissions.isAdmin) {
          showToast(
            `Connected as Admin with ${canApprove ? 'approval' : ''}${canApprove && canMint ? ' and ' : ''}${canMint ? 'minting' : ''} privileges`,
            'info'
          );
        } else {
          showToast('Connected with read-only access', 'warning');
        }
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      showToast('Failed to load user permissions', 'error');
    } finally {
      setLoading(prev => ({ ...prev, checkingPermissions: false }));
    }
  }, []);

  interface AdminInfo {
    address: `0x${string}`;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    name?: string;
    addedAt?: string;
  }

  const loadAdminData = React.useCallback(async () => {
    setLoading(prev => ({ ...prev, loadingAdmins: true }));
    try {
      const [adminInfo, adminCount, superAdminCount] = await Promise.all([
        getAllAdminInfo(),
        getAdminCount(),
        getSuperAdminCount()
      ]);
      const formattedAdmins: AdminUser[] = (adminInfo as AdminInfo[]).map((admin) => ({
        address: admin.address,
        role: admin.isSuperAdmin ? 'DEFAULT_ADMIN_ROLE' : 'ADMIN_ROLE',
        name: admin.name ?? `Admin ${admin.address.slice(0, 6)}...`,
        addedAt: admin.addedAt ?? new Date().toISOString().split('T')[0],
        isAdmin: admin.isAdmin,
        isSuperAdmin: admin.isSuperAdmin
      }));
      setAdmins(formattedAdmins);
      setAdminStats({
        totalAdmins: adminCount,
        totalSuperAdmins: superAdminCount
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      showToast('Failed to load admin data from blockchain', 'error');
    } finally {
      setLoading(prev => ({ ...prev, loadingAdmins: false }));
    }
  }, []);

  useEffect(() => {
    loadUserPermissions();
    loadAdminData();
  }, [loadUserPermissions, loadAdminData]);

  const refreshAdminData = () => {
    loadAdminData();
    loadUserPermissions();
  };

  const isValidEthereumAddress = (address: string): boolean => {
    return isValidAddress(address);
  };

  const handleApproveProjectByAddress = async () => {
    if (!userPermissions.canApproveProjects) {
      showToast('Access denied: No approval privileges', 'error');
      return;
    }
    if (!approvalForm.projectAddress.trim()) {
      showToast('Please enter a project address', 'error');
      return;
    }
    if (!isValidEthereumAddress(approvalForm.projectAddress)) {
      showToast('Invalid Ethereum address', 'error');
      return;
    }
    const project = projects.find(p =>
      p.address.toLowerCase() === approvalForm.projectAddress.toLowerCase()
    );
    if (!project) {
      showToast('Project not found', 'error');
      return;
    }
    if (project.approved) {
      showToast('Project already approved', 'info');
      return;
    }
    setLoading(prev => ({ ...prev, approving: approvalForm.projectAddress }));
    try {
      const result = await approveProject(approvalForm.projectAddress as `0x${string}`);
      if (result.success) {
        setProjects(prev =>
          prev.map(proj =>
            proj.address.toLowerCase() === approvalForm.projectAddress.toLowerCase()
              ? { ...proj, approved: true }
              : proj
          )
        );
        setApprovalForm({ projectAddress: '' });
        showToast('Project approved successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to approve project', 'error');
      }
    } catch (error) {
      console.error('Error approving project:', error);
      showToast('Failed to approve project', 'error');
    } finally {
      setLoading(prev => ({ ...prev, approving: null }));
    }
  };

  const handleApproveProject = async (address: string) => {
    if (!userPermissions.canApproveProjects) {
      showToast('Access denied: No approval privileges', 'error');
      return;
    }
    setLoading(prev => ({ ...prev, approving: address }));
    try {
      const result = await approveProject(address as `0x${string}`);
      if (result.success) {
        setProjects(prev =>
          prev.map(project =>
            project.address === address ? { ...project, approved: true } : project
          )
        );
        showToast('Project approved!', 'success');
      } else {
        showToast(result.error || 'Failed to approve project', 'error');
      }
    } catch (error) {
      console.error('Error approving project:', error);
      showToast('Failed to approve project', 'error');
    } finally {
      setLoading(prev => ({ ...prev, approving: null }));
    }
  };

  const handleRevokeProject = (address: string) => {
    if (!userPermissions.canApproveProjects) {
      showToast('Access denied: No approval privileges', 'error');
      return;
    }
    setProjects(prev =>
      prev.map(project =>
        project.address === address ? { ...project, approved: false } : project
      )
    );
    showToast('Project approval revoked', 'info');
  };

  const handleRemoveProject = (address: string) => {
    if (!userPermissions.isSuperAdmin) {
      showToast('Access denied: Super Admin required', 'error');
      return;
    }
    setProjects(prev => prev.filter(project => project.address !== address));
    showToast('Project removed', 'info');
  };

  const handleMintIREC = () => {
    if (!userPermissions.canMintTokens) {
      showToast('Access denied: No minting privileges', 'error');
      return;
    }
    if (!mintForm.projectAddress || !mintForm.metadataURI) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    const project = projects.find(p => p.address === mintForm.projectAddress);
    if (!project) {
      showToast('Project not found', 'error');
      return;
    }
    if (!project.approved) {
      showToast('Project not approved', 'error');
      return;
    }
    const newIREC: IRECToken = {
      tokenId: irecs.length + 1,
      owner: mintForm.projectAddress,
      projectAddress: mintForm.projectAddress,
      projectName: project.name,
      metadataURI: mintForm.metadataURI,
      mintedAt: new Date().toISOString().split('T')[0],
      energyAmount: parseInt(mintForm.energyAmount) || 0
    };
    setIRECs(prev => [...prev, newIREC]);
    setMintForm({ projectAddress: '', metadataURI: '', energyAmount: '' });
    showToast('IREC Token minted!', 'success');
  };

  // ✅ UPDATED HANDLE GRANT ROLE
  const handleGrantRole = async (role: 'ADMIN_ROLE' | 'DEFAULT_ADMIN_ROLE') => {
    if (!userPermissions.canGrantRoles) {
      showToast('Access denied: No role granting privileges', 'error');
      return;
    }

    if (!newAdminForm.address || !newAdminForm.name) {
      showToast('Please fill all fields', 'error');
      return;
    }

    if (!isValidEthereumAddress(newAdminForm.address)) {
      showToast('Invalid Ethereum address', 'error');
      return;
    }

    const existingAdmin = admins.find(admin =>
      admin.address.toLowerCase() === newAdminForm.address.toLowerCase()
    );

    if (existingAdmin) {
      if (role === 'ADMIN_ROLE' && existingAdmin.isAdmin) {
        showToast('Address already has admin role', 'warning');
        return;
      }
      if (role === 'DEFAULT_ADMIN_ROLE' && existingAdmin.isSuperAdmin) {
        showToast('Address already has super admin role', 'warning');
        return;
      }
    }

    const targetAddress = newAdminForm.address;
    setLoading(prev => ({ ...prev, grantingRole: targetAddress }));

    try {
      const result = role === 'ADMIN_ROLE'
        ? await grantAdminRole(targetAddress as `0x${string}`)
        : await grantSuperAdminRole(targetAddress as `0x${string}`);

      if (result.success) {
        showToast(`${role === 'ADMIN_ROLE' ? 'Admin' : 'Super Admin'} role granted successfully!`, 'success');
        setNewAdminForm({ address: '', role: 'ADMIN_ROLE', name: '' });
        
        // Load admin data and ensure loading state is cleared after it completes
        try {
          await loadAdminData();
        } catch (adminLoadError) {
          console.error('Error reloading admin data:', adminLoadError);
          showToast('Role granted but failed to refresh admin list', 'warning');
        }
      } else {
        showToast(result.error || 'Transaction failed on-chain', 'error');
      }
    } catch (error) {
      console.error('Error granting role:', error);
      showToast('Failed to grant role', 'error');
    } finally {
      // Ensure loading state is always cleared
      setLoading(prev => ({ ...prev, grantingRole: null }));
    }
  };

  // ✅ UPDATED HANDLE REVOKE ROLE
  const handleRevokeRole = async (address: `0x${string}`, isRevokingSuper: boolean) => {
    if (!userPermissions.canGrantRoles) {
      showToast('Access denied: No role revoking privileges', 'error');
      return;
    }

    if (address.toLowerCase() === userPermissions.address?.toLowerCase()) {
      showToast('Cannot revoke your own privileges', 'error');
      return;
    }

    setLoading(prev => ({ ...prev, revokingRole: address }));

    try {
      const result = isRevokingSuper
        ? await revokeSuperAdminRole(address)
        : await revokeAdminRole(address);

      if (result.success) {
        showToast(`${isRevokingSuper ? 'Super Admin' : 'Admin'} role revoked!`, 'success');
        await loadAdminData();
      } else {
        showToast(result.error || 'Transaction failed on-chain', 'error');
      }
    } catch (error) {
      console.error('Error revoking role:', error);
      showToast('Failed to revoke role', 'error');
    } finally {
      setLoading(prev => ({ ...prev, revokingRole: null }));
    }
  };

  const handleSettingsChange = (field: string, value: string) => {
    if (!userPermissions.isSuperAdmin) {
      showToast('Access denied: Super Admin required', 'error');
      return;
    }
    setPlatformSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = () => {
    if (!userPermissions.isSuperAdmin) {
      showToast('Access denied: Super Admin required', 'error');
      return;
    }
    console.log('Saving settings:', platformSettings);
    showToast('Settings saved', 'success');
  };

  // Statistics
  const approvedProjects = projects.filter(p => p.approved).length;
  const pendingProjects = projects.filter(p => !p.approved).length;
  const totalIRECs = irecs.length;
  const totalEnergy = irecs.reduce((sum, irec) => sum + (irec.energyAmount || 0), 0);

  type TabType = 'overview' | 'projects' | 'irecs' | 'admins' | 'settings';

  const TabButton: React.FC<{
    tab: TabType;
    label: string;
    icon: React.ReactNode;
    count?: number;
    disabled?: boolean;
  }> = ({ tab, label, icon, count, disabled = false }) => (
    <button
      onClick={() => !disabled && setActiveTab(tab)}
      disabled={disabled}
      className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm ${
        disabled
          ? 'border-transparent text-gray-400 cursor-not-allowed'
          : activeTab === tab
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IREC Admin Dashboard</h1>
          {userPermissions.address && (
            <p className="text-sm text-gray-600 mt-1">
              Connected: {formatAddress(userPermissions.address)}
              {userPermissions.isSuperAdmin && (
                <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  Super Admin
                </span>
              )}
              {userPermissions.isAdmin && !userPermissions.isSuperAdmin && (
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  Admin
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshAdminData}
            disabled={loading.loadingAdmins || loading.checkingPermissions}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${(loading.loadingAdmins || loading.checkingPermissions) ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <StatCard
          icon={<Building className="h-8 w-8" />}
          title="Total Projects"
          value={projects.length.toString()}
          change={`+${Math.floor(projects.length * 0.125)}`}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="h-8 w-8" />}
          title="Approved Projects"
          value={approvedProjects.toString()}
          change={`+${Math.floor(approvedProjects * 0.11)}`}
          color="green"
        />
        <StatCard
          icon={<Award className="h-8 w-8" />}
          title="IREC Tokens"
          value={totalIRECs.toString()}
          change="+5"
          color="purple"
        />
        <StatCard
          icon={<DollarSign className="h-8 w-8" />}
          title="Total Energy"
          value={totalEnergy.toString()}
          change="+120"
          color="yellow"
        />
        <StatCard
          icon={<Key className="h-8 w-8" />}
          title="Total Admins"
          value={adminStats.totalAdmins.toString()}
          change={`+${Math.floor(adminStats.totalAdmins * 0.1)}`}
          color="indigo"
          loading={loading.loadingAdmins}
        />
        <StatCard
          icon={<Shield className="h-8 w-8" />}
          title="Super Admins"
          value={adminStats.totalSuperAdmins.toString()}
          change="0"
          color="red"
          loading={loading.loadingAdmins}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-t-lg">
        <nav className="flex space-x-1 px-6">
          <TabButton tab="overview" label="Overview" icon={<Database className="h-4 w-4" />} />
          <TabButton
            tab="projects"
            label="Projects"
            icon={<Building className="h-4 w-4" />}
            count={pendingProjects}
            disabled={!userPermissions.canApproveProjects}
          />
          <TabButton
            tab="irecs"
            label="IREC Tokens"
            icon={<Award className="h-4 w-4" />}
            count={totalIRECs}
            disabled={!userPermissions.canMintTokens}
          />
          <TabButton
            tab="admins"
            label="Admin Management"
            icon={<Users className="h-4 w-4" />}
            count={admins.length}
            disabled={!userPermissions.canGrantRoles}
          />
          <TabButton
            tab="settings"
            label="Settings"
            icon={<Settings className="h-4 w-4" />}
            disabled={!userPermissions.isSuperAdmin}
          />
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-lg shadow-md">
        {activeTab === 'overview' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Overview</h3>
            {!userPermissions.isAdmin && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-yellow-800 font-medium">Limited Access</p>
                </div>
                <p className="text-yellow-700 text-sm mt-1">You currently have read-only access.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Project Approved</p>
                      <p className="text-xs text-gray-600">Green Solar Farm - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Award className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">IREC Token Minted</p>
                      <p className="text-xs text-gray-600">Token #127 - 4 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">System Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Blockchain Connection</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                     <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">IPFS Gateway</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && userPermissions.canApproveProjects && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter project address (0x...)"
                  value={approvalForm.projectAddress}
                  onChange={(e) => setApprovalForm({ projectAddress: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleApproveProjectByAddress}
                  disabled={loading.approving === approvalForm.projectAddress}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {loading.approving === approvalForm.projectAddress ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span>Approve</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Energy (MWh)
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
                  {projects.map((project) => (
                    <tr key={project.address} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{project.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {project.address.slice(0, 6)}...{project.address.slice(-4)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.energyGenerated?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.approved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {project.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {!project.approved ? (
                          <button
                            onClick={() => handleApproveProject(project.address)}
                            disabled={loading.approving === project.address}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 flex items-center space-x-1"
                          >
                            {loading.approving === project.address ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            <span>Approve</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevokeProject(project.address)}
                            className="text-yellow-600 hover:text-yellow-900 flex items-center space-x-1"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Revoke</span>
                          </button>
                        )}
                        {userPermissions.isSuperAdmin && (
                          <button
                            onClick={() => handleRemoveProject(project.address)}
                            className="text-red-600 hover:text-red-900 ml-2 flex items-center space-x-1"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* IRECs Tab */}
        {activeTab === 'irecs' && userPermissions.canMintTokens && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">IREC Token Management</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Mint New IREC Token</h4>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={mintForm.projectAddress}
                    onChange={(e) =>
                      setMintForm(prev => ({ ...prev, projectAddress: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Project</option>
                    {projects
                      .filter(p => p.approved)
                      .map(project => (
                        <option key={project.address} value={project.address}>
                          {project.name}
                        </option>
                      ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Metadata URI"
                    value={mintForm.metadataURI}
                    onChange={(e) =>
                      setMintForm(prev => ({ ...prev, metadataURI: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Energy Amount (MWh)"
                    value={mintForm.energyAmount}
                    onChange={(e) =>
                      setMintForm(prev => ({ ...prev, energyAmount: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleMintIREC}
                  className="mt-3 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  <Award className="h-4 w-4" />
                  <span>Mint IREC Token</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Minted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Energy (MWh)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {irecs.map((irec) => (
                    <tr key={irec.tokenId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{irec.tokenId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{irec.projectName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                          {formatAddress(irec.owner as `0x${string}`)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(irec.mintedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {irec.energyAmount || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && userPermissions.canGrantRoles && (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Admin Management</h3>
              <div className="bg-gray-50 p-4 rounded-lg w-full md:w-1/3">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Admin</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ethereum Address (0x...)"
                    value={newAdminForm.address}
                    onChange={e =>
                      setNewAdminForm({ ...newAdminForm, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newAdminForm.role}
                    onChange={e =>
                      setNewAdminForm({
                        ...newAdminForm,
                        role: e.target.value as 'ADMIN_ROLE' | 'DEFAULT_ADMIN_ROLE'
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ADMIN_ROLE">Regular Admin</option>
                    <option value="DEFAULT_ADMIN_ROLE">Super Admin</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Admin Name"
                    value={newAdminForm.name}
                    onChange={e =>
                      setNewAdminForm({ ...newAdminForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleGrantRole(newAdminForm.role)}
                    disabled={loading.grantingRole !== null}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm w-full justify-center"
                  >
                    {loading.grantingRole === newAdminForm.address ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>Add Admin</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
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
                      Added
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.address} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{formatAddress(admin.address)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            admin.isSuperAdmin
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {admin.isSuperAdmin ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.addedAt || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {userPermissions.isSuperAdmin &&
                          !(admin.address.toLowerCase() === userPermissions.address?.toLowerCase()) && (
                            <button
                              onClick={() => handleRevokeRole(admin.address, admin.isSuperAdmin)}
                              className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Revoke</span>
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && userPermissions.isSuperAdmin && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Settings</h3>
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Token URI</label>
                <input
                  type="text"
                  value={platformSettings.baseTokenURI}
                  onChange={e => handleSettingsChange('baseTokenURI', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={platformSettings.platformFee}
                  onChange={e => handleSettingsChange('platformFee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Energy per Token (MWh)
                </label>
                <input
                  type="number"
                  value={platformSettings.minEnergyPerToken}
                  onChange={e => handleSettingsChange('minEnergyPerToken', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Address</label>
                <input
                  type="text"
                  readOnly
                  value={platformSettings.contractAddress}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed sm:text-sm"
                />
              </div>
              <button
                onClick={saveSettings}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IRECAdminDashboard;

// Dummy implementation for canPerformAction; replace with real logic as needed
function canPerformAction(): Promise<boolean> {
  // TODO: Implement actual permission logic
  return Promise.resolve(true);
}