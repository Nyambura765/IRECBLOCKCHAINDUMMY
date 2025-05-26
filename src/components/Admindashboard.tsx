import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  AlertCircle,
} from 'lucide-react';

// Import hooks/services
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

// Wagmi + Viem imports
import { waitForTransactionReceipt } from '@wagmi/core';
import { config } from '../Config';


// Define a minimal TransactionReceipt type for local use
type TransactionReceipt = {
  status: string;
  logs?: Array<{ topics: string[]; data?: string }>;
};
import type { Hex } from 'viem';

// Types
type EthereumAddress = `0x${string}`;
interface Project {
  address: EthereumAddress;
  approved: boolean;
  name: string;
  description: string;
  energyGenerated?: number;
  lastActivity?: string;
}
interface IRECToken {
  tokenId: number;
  owner: EthereumAddress;
  projectAddress: EthereumAddress;
  projectName: string;
  metadataURI: string;
  mintedAt: string;
  energyAmount?: number;
}
interface AdminInfo {
  address: EthereumAddress;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInitialSuperAdmin: boolean;
  name?: string;
}
interface LoadingState {
  approving: Set<string>;
  grantingRole: Set<string>;
  revokingRole: Set<string>;
  minting: Set<string>;
  savingSettings: boolean;
  loadingAdmins: boolean;
  checkingPermissions: boolean;
  loadingProjects: boolean;
  loadingIRECs: boolean;
}
interface UserPermissions {
  address: EthereumAddress | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInitialSuperAdmin: boolean;
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
    lastActivity: '2024-01-15',
  },
  {
    address: '0x456def000000000000000000000000000000abc123',
    approved: false,
    name: 'Wind Power Co',
    description: 'Offshore wind turbines generating clean energy for coastal cities',
    energyGenerated: 2300,
    lastActivity: '2024-01-20',
  },
];
const INITIAL_SUPER_ADMIN_ADDRESS = '0x296EA797C9A5935c4447e638a7a7ce04c1039259';
const mockIRECs: IRECToken[] = [
  {
    tokenId: 1,
    owner: '0x123abc000000000000000000000000000000def456',
    projectAddress: '0x123abc000000000000000000000000000000def456',
    projectName: 'Green Solar Farm',
    metadataURI: 'https://ipfs.io/ipfs/Qm...abc123   ',
    mintedAt: '2024-01-10',
    energyAmount: 500,
  },
];

// Toast Component
const Toast: React.FC<{
  show: boolean;
  message: string | React.ReactNode;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}> = ({ show, message, type, onClose }) => {
  useEffect(() => {
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
      role="alert"
    >
      {type === 'success' && <CheckCircle className="h-5 w-5" aria-hidden="true" />}
      {type === 'error' && <XCircle className="h-5 w-5" aria-hidden="true" />}
      {type === 'warning' && <AlertCircle className="h-5 w-5" aria-hidden="true" />}
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
            <div className="animate-pulse bg-gray-300 h-8 w-16 rounded" aria-label="Loading..." />
          ) : (
            value
          )}
        </p>
      </div>
      <div>{icon}</div>
    </div>
    <div className="mt-4">
      <span className={`text-sm font-medium text-${color}-600`}>{change}</span>
      <span className="text-sm text-gray-500 ml-1">vs last month</span>
    </div>
  </div>
);

// ActionButton Component
const ActionButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}> = ({
  onClick,
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  children,
  variant = 'primary',
  size = 'md',
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Main Dashboard Component
const IRECAdminDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [irecs, setIRECs] = useState<IRECToken[]>([]);
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'irecs' | 'admins' | 'settings'
  >('overview');
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    address: null,
    isAdmin: false,
    isSuperAdmin: false,
    isInitialSuperAdmin: false,
    canGrantRoles: false,
    canApproveProjects: false,
    canMintTokens: false,
  });
  const [adminStats, setAdminStats] = useState({
    totalAdmins: 0,
    totalSuperAdmins: 0,
  });
  const [loading, setLoading] = useState<LoadingState>({
    approving: new Set(),
    grantingRole: new Set(),
    revokingRole: new Set(),
    minting: new Set(),
    savingSettings: false,
    loadingAdmins: false,
    checkingPermissions: true,
    loadingProjects: true,
    loadingIRECs: true,
  });
  const [toast, setToast] = useState<{
    show: boolean;
    message: string | React.ReactNode;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'success',
  });
  const [approvalForm, setApprovalForm] = useState({ projectAddress: '' });
  const [platformSettings, setPlatformSettings] = useState({
    baseTokenURI: 'https://ipfs.io/ipfs/ ',
    platformFee: '2.5',
    minEnergyPerToken: '50',
    contractAddress: '0xContract...Address',
  });
  const [newAdminForm, setNewAdminForm] = useState({
    address: '',
    role: 'ADMIN_ROLE' as 'ADMIN_ROLE' | 'DEFAULT_ADMIN_ROLE',
    name: '',
  });
  const [mintForm, setMintForm] = useState({
    projectAddress: '',
    metadataURI: '',
    energyAmount: '',
  });

  // Ref to track component mount state
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const showToast = (
    message: string | React.ReactNode,
    type: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setToast({ show: true, message, type });
  };

  const loadUserPermissions = useCallback(async () => {
    setLoading((prev) => ({ ...prev, checkingPermissions: true }));
    try {
      const permissions = await getCurrentUserPermissions();
      if (permissions.error || !permissions.address) {
        showToast(
          `Permission check failed: ${permissions.error ?? 'No wallet connected'}`,
          'warning'
        );
        return;
      }

      const isInitialSuperAdmin =
        permissions.address?.toLowerCase() ===
        INITIAL_SUPER_ADMIN_ADDRESS.toLowerCase();

      setUserPermissions({
        address: permissions.address,
        isAdmin: permissions.isAdmin,
        isSuperAdmin: permissions.isSuperAdmin,
        isInitialSuperAdmin,
        canGrantRoles:
          permissions.isSuperAdmin || isInitialSuperAdmin,
        canApproveProjects:
          permissions.isAdmin ||
          permissions.isSuperAdmin ||
          isInitialSuperAdmin,
        canMintTokens:
          permissions.isAdmin ||
          permissions.isSuperAdmin ||
          isInitialSuperAdmin,
      });

      if (isInitialSuperAdmin) {
        showToast('Connected as Initial Super Admin with full privileges', 'success');
      } else if (permissions.isSuperAdmin) {
        showToast('Connected as Super Admin with full privileges', 'success');
      } else if (permissions.isAdmin) {
        showToast('Connected as Admin with limited privileges', 'info');
      } else {
        showToast('Connected with read-only access', 'warning');
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
      showToast('Failed to load user permissions', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, checkingPermissions: false }));
    }
  }, []);

  const loadAdminData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, loadingAdmins: true }));
    try {
      const [adminInfo, adminCount, superAdminCount] = await Promise.all([
        getAllAdminInfo(),
        getAdminCount(),
        getSuperAdminCount(),
      ]);

      const formattedAdmins = adminInfo.map((admin) => ({
        ...admin,
        name: `Admin ${admin.address.slice(0, 6)}...`,
      }));

      setAdmins(formattedAdmins);
      setAdminStats({
        totalAdmins: adminCount,
        totalSuperAdmins: superAdminCount,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      showToast('Failed to load admin data from blockchain', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, loadingAdmins: false }));
    }
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading((prev) => ({ ...prev, loadingProjects: true }));
    try {
      // Replace with real blockchain call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProjects(mockProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      showToast('Failed to load projects', 'error');
      setProjects([]);
    } finally {
      setLoading((prev) => ({ ...prev, loadingProjects: false }));
    }
  }, []);

  const loadIRECs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, loadingIRECs: true }));
    try {
      // Replace with real blockchain call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIRECs(mockIRECs);
    } catch (error) {
      console.error('Error loading IRECs:', error);
      showToast('Failed to load IREC tokens', 'error');
      setIRECs([]);
    } finally {
      setLoading((prev) => ({ ...prev, loadingIRECs: false }));
    }
  }, []);

  useEffect(() => {
    Promise.all([
      loadProjects(),
      loadIRECs(),
      loadUserPermissions(),
      loadAdminData(),
    ]);
  }, [loadProjects, loadIRECs, loadUserPermissions, loadAdminData]);

  const refreshAdminData = async () => {
    await Promise.all([loadAdminData(), loadUserPermissions()]);
  };

  const handleApproveProjectByAddress = async () => {
    if (!userPermissions.canApproveProjects) {
      showToast('Access denied: No approval privileges', 'error');
      return;
    }

    const project = projects.find(
      (p) =>
        p.address.toLowerCase() ===
        approvalForm.projectAddress.toLowerCase()
    );

    if (!project) {
      showToast('Project not found', 'error');
      return;
    }

    if (project.approved) {
      showToast('Project already approved', 'info');
      return;
    }

    setLoading((prev) => ({
      ...prev,
      approving: new Set([...prev.approving, approvalForm.projectAddress]),
    }));

    try {
      const result = await approveProject(
        approvalForm.projectAddress as EthereumAddress
      );

      if (result.success) {
        setProjects((prev) =>
          prev.map((proj) =>
            proj.address === approvalForm.projectAddress
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
      setLoading((prev) => ({
        ...prev,
        approving: new Set(
          [...prev.approving].filter(
            (addr) => addr !== approvalForm.projectAddress
          )
        ),
      }));
    }
  };

  const handleApproveProject = async (address: string) => {
    if (!userPermissions.canApproveProjects) {
      showToast('Access denied: No approval privileges', 'error');
      return;
    }

    setLoading((prev) => ({
      ...prev,
      approving: new Set([...prev.approving, address]),
    }));

    try {
      const result = await approveProject(address as EthereumAddress);

      if (result.success) {
        setProjects((prev) =>
          prev.map((project) =>
            project.address === address
              ? { ...project, approved: true }
              : project
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
      setLoading((prev) => ({
        ...prev,
        approving: new Set([...prev.approving].filter((addr) => addr !== address)),
      }));
    }
  };

  const handleRevokeProject = async (address: string) => {
    if (!userPermissions.canApproveProjects) {
      showToast('Access denied: No approval privileges', 'error');
      return;
    }

    setLoading((prev) => ({
      ...prev,
      approving: new Set([...prev.approving, address]),
    }));

    try {
      setProjects((prev) =>
        prev.map((project) =>
          project.address === address
            ? { ...project, approved: false }
            : project
        )
      );
      showToast('Project approval revoked', 'info');
    } catch (error) {
      console.error('Error revoking project:', error);
      showToast('Failed to revoke project approval', 'error');
    } finally {
      setLoading((prev) => ({
        ...prev,
        approving: new Set([...prev.approving].filter((addr) => addr !== address)),
      }));
    }
  };

  const handleRemoveProject = (address: string) => {
    if (
      !userPermissions.isSuperAdmin &&
      !userPermissions.isInitialSuperAdmin
    ) {
      showToast('Access denied: Super Admin required', 'error');
      return;
    }

    setProjects((prev) => prev.filter((project) => project.address !== address));
    showToast('Project removed', 'info');
  };

  const handleMintIREC = async () => {
    if (!userPermissions.canMintTokens) {
      showToast('Access denied: No minting privileges', 'error');
      return;
    }

    if (!mintForm.projectAddress || !mintForm.metadataURI) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const project = projects.find(
      (p) => p.address === mintForm.projectAddress
    );

    if (!project) {
      showToast('Project not found', 'error');
      return;
    }

    if (!project.approved) {
      showToast('Project not approved', 'error');
      return;
    }

    setLoading((prev) => ({
      ...prev,
      minting: new Set([...prev.minting, mintForm.projectAddress]),
    }));

    try {
      const newIREC: IRECToken = {
        tokenId: irecs.length + 1,
        owner: mintForm.projectAddress as EthereumAddress,
        projectAddress: mintForm.projectAddress as EthereumAddress,
        projectName: project.name,
        metadataURI: mintForm.metadataURI,
        mintedAt: new Date().toISOString().split('T')[0],
        energyAmount: parseInt(mintForm.energyAmount) || 0,
      };

      setIRECs((prev) => [...prev, newIREC]);
      setMintForm({
        projectAddress: '',
        metadataURI: '',
        energyAmount: '',
      });
      showToast('IREC Token minted!', 'success');
    } catch (error) {
      console.error('Error minting IREC:', error);
      showToast('Failed to mint IREC token', 'error');
    } finally {
      setLoading((prev) => ({
        ...prev,
        minting: new Set(
          [...prev.minting].filter((addr) => addr !== mintForm.projectAddress)
        ),
      }));
    }
  };

  const handleGrantRole = async (
    role: 'ADMIN_ROLE' | 'DEFAULT_ADMIN_ROLE'
  ) => {
    if (!userPermissions.canGrantRoles) {
      showToast('Access denied: No role granting privileges', 'error');
      return;
    }

    if (!newAdminForm.address || !newAdminForm.name) {
      showToast('Please fill all fields', 'error');
      return;
    }

    if (!isValidAddress(newAdminForm.address)) {
      showToast('Invalid Ethereum address', 'error');
      return;
    }

    const existingAdmin = admins.find(
      (admin) =>
        admin.address.toLowerCase() ===
        newAdminForm.address.toLowerCase()
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

    const targetAddress = newAdminForm.address as EthereumAddress;

    setLoading((prev) => ({
      ...prev,
      grantingRole: new Set([...prev.grantingRole, targetAddress]),
    }));

    let hash: string | undefined;

    try {
      let txResult;
      if (role === 'ADMIN_ROLE') {
        txResult = await grantAdminRole(targetAddress);
      } else {
        txResult = await grantSuperAdminRole(targetAddress);
      }

      if (typeof txResult === 'string') {
        hash = txResult;
      } else if (txResult && typeof txResult === 'object') {
        type TxResultType = { hash?: string; transactionHash?: string; success?: boolean; error?: string };
        const typedTxResult = txResult as TxResultType;
        if ('hash' in typedTxResult && typeof typedTxResult.hash === 'string' && typedTxResult.hash) {
          hash = typedTxResult.hash;
        } else if ('transactionHash' in typedTxResult && typeof typedTxResult.transactionHash === 'string' && typedTxResult.transactionHash) {
          hash = typedTxResult.transactionHash;
        } else if ('success' in typedTxResult && typedTxResult.success === false) {
          throw new Error(typedTxResult.error || 'Transaction failed');
        } else {
          throw new Error('Unexpected transaction response format');
        }
      } else {
        throw new Error('Invalid transaction response');
      }

      if (!hash) {
        throw new Error('Transaction hash not found in response');
      }

      showToast(`Transaction submitted: ${getExplorerUrl(hash)}`, 'info');

      const receipt = await waitForTransactionReceipt(config, {
        hash: hash as Hex,
        confirmations: 2,
        pollingInterval: 5000,
        timeout: 60000,
      });

      if (receipt.status !== 'success') {
        throw new Error(`Transaction failed on-chain: ${getTransactionError(receipt)}`);
      }

      showToast('Role granted successfully!', 'success');
      setNewAdminForm({ address: '', role: 'ADMIN_ROLE', name: '' });
      await refreshAdminData();
    } catch (error: unknown) {
      console.error('Error granting role:', error);

      let errorMessage = 'Failed to grant role';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'reason' in error) {
        errorMessage = (error as { reason: string }).reason;
      } else if ((error as { code?: string })?.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      } else if ((error as { code?: string })?.code === 'CALL_EXCEPTION') {
        errorMessage = 'Smart contract execution failed';
      } else if ((error as { code?: string })?.code === 'TRANSACTION_REPLACED') {
        errorMessage = 'Transaction replaced';
      } else if ((error as { code?: string })?.code === 'TIMEOUT') {
        errorMessage = 'Transaction timed out';
      }

      showToast(errorMessage, 'error');
    } finally {
      if (isMountedRef.current) {
        setLoading((prev) => ({
          ...prev,
          grantingRole: new Set(
            [...prev.grantingRole].filter((addr) => addr !== targetAddress)
          ),
        }));
      }
    }
  };

  const handleRevokeRole = async (
    address: EthereumAddress,
    isRevokingSuper: boolean
  ) => {
    if (!userPermissions.canGrantRoles) {
      showToast('Access denied: No role revoking privileges', 'error');
      return;
    }

    if (
      address.toLowerCase() ===
      userPermissions.address?.toLowerCase()
    ) {
      showToast('Cannot revoke your own privileges', 'error');
      return;
    }

    setLoading((prev) => ({
      ...prev,
      revokingRole: new Set([...prev.revokingRole, address]),
    }));

    try {
      const result = await (isRevokingSuper
        ? revokeSuperAdminRole(address)
        : revokeAdminRole(address));

      if (result.success) {
        showToast(
          `${isRevokingSuper ? 'Super Admin' : 'Admin'} role revoked!`,
          'success'
        );
        await refreshAdminData();
      } else {
        showToast(result.error || 'Transaction failed on-chain', 'error');
      }
    } catch (error) {
      console.error('Error revoking role:', error);
      showToast('Failed to revoke role', 'error');
    } finally {
      setLoading((prev) => ({
        ...prev,
        revokingRole: new Set(
          [...prev.revokingRole].filter((addr) => addr !== address)
        ),
      }));
    }
  };

  const handleSettingsChange = (field: string, value: string) => {
    if (!userPermissions.isInitialSuperAdmin) {
      showToast(
        'Access denied: Only Initial Super Admin can modify settings',
        'error'
      );
      return;
    }

    setPlatformSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveSettings = async () => {
    if (!userPermissions.isInitialSuperAdmin) {
      showToast(
        'Access denied: Only Initial Super Admin can save settings',
        'error'
      );
      return;
    }

    setLoading((prev) => ({ ...prev, savingSettings: true }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Saving settings:', platformSettings);
      showToast('Settings saved', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, savingSettings: false }));
    }
  };

  const LoadingStateHelper = {
    isAnyLoading: (loading: LoadingState) =>
      loading.approving.size > 0 ||
      loading.grantingRole.size > 0 ||
      loading.revokingRole.size > 0 ||
      loading.minting.size > 0 ||
      loading.savingSettings ||
      loading.loadingAdmins ||
      loading.checkingPermissions ||
      loading.loadingProjects ||
      loading.loadingIRECs,
    getCurrentOperations: (loading: LoadingState): string[] => {
      const operations: string[] = [];
      if (loading.approving.size > 0) {
        operations.push(
          `Approving project(s): ${Array.from(loading.approving)
            .map((addr) => addr.slice(0, 6))
            .join(', ')}`
        );
      }
      if (loading.grantingRole.size > 0) {
        operations.push(
          `Granting role(s) to: ${Array.from(loading.grantingRole)
            .map((addr) => addr.slice(0, 6))
            .join(', ')}`
        );
      }
      if (loading.revokingRole.size > 0) {
        operations.push(
          `Revoking role(s) from: ${Array.from(loading.revokingRole)
            .map((addr) => addr.slice(0, 6))
            .join(', ')}`
        );
      }
      if (loading.minting.size > 0) {
        operations.push(
          `Minting IREC(s) for: ${Array.from(loading.minting)
            .map((addr) => addr.slice(0, 6))
            .join(', ')}`
        );
      }
      if (loading.savingSettings) operations.push('Saving settings...');
      if (loading.loadingAdmins) operations.push('Loading admin data...');
      if (loading.checkingPermissions)
        operations.push('Checking permissions...');
      if (loading.loadingProjects) operations.push('Loading projects...');
      if (loading.loadingIRECs) operations.push('Loading IREC tokens...');
      return operations;
    },
  };

  // Statistics
  const approvedProjects = projects.filter((p) => p.approved).length;
  const pendingProjects = projects.filter((p) => !p.approved).length;
  const totalIRECs = irecs.length;
  const totalEnergy = irecs.reduce(
    (sum, irec) => sum + (irec.energyAmount || 0),
    0
  );

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
      aria-current={activeTab === tab ? 'page' : undefined}
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

  // Helper functions
  const getExplorerUrl = (hash: string): string => {
    const baseUrls: Record<number, string> = {
      1: 'https://etherscan.io/tx/ ',
      137: 'https://polygonscan.com/tx/ ',
      11155111: 'https://sepolia.etherscan.io/tx/ ', // Sepolia testnet
    };
    const chainId: number = config.getClient().chain?.id || 1;
    return `${baseUrls[chainId] ?? baseUrls[1]}${hash}`;
  };

  const getTransactionError = (receipt: TransactionReceipt): string => {
    if (receipt.status === 'success') return 'Transaction succeeded';

    if (receipt.logs && receipt.logs.length > 0) {
      const errorLog = receipt.logs.find(
        (log) => log.topics[0] === '0x08c379a0'
      ); // Error(string)
      if (errorLog && errorLog.data) {
        try {
          const decoded = decodeErrorReason(errorLog.data as Hex);
          if (decoded) return decoded;
        } catch (e) {
          console.error('Failed to decode error data', e);
        }
      }
    }

    return `Transaction reverted without reason (status: ${receipt.status})`;
  };

  // Helper to convert hex string to UTF-8 string
  const hexToString = (hex: string): string => {
    let str = '';
    // Remove 0x if present
    if (hex.startsWith('0x')) hex = hex.slice(2);
    for (let i = 0; i < hex.length; i += 2) {
      const code = parseInt(hex.substr(i, 2), 16);
      if (code) str += String.fromCharCode(code);
    }
    return str;
  };

  const decodeErrorReason = (data: Hex): string | null => {
    if (!data || data === '0x') return null;

    try {
      if (data.startsWith('0x08c379a0')) {
        const messageStart = Number.parseInt(data.substring(138, 146), 16) + 64;
        const messageLength = Number.parseInt(
          data.substring(messageStart, messageStart + 64),
          16
        );
        const messageHex = data.substring(
          messageStart + 64,
          messageStart + 64 + messageLength * 2
        );
        return hexToString(messageHex);
      }
      return 'Custom error';
    } catch (e) {
      console.error('Error decoding', e);
      return null;
    }
  };

  // Render
  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast((prev) => ({ ...prev, show: false }))
        }
      />

      {LoadingStateHelper.isAnyLoading(loading) && (
        <div className="fixed top-16 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {LoadingStateHelper.getCurrentOperations(loading).map(
            (op, index) => (
              <p key={index} className="text-sm">
                {op}
              </p>
            )
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            IREC Admin Dashboard
          </h1>
          {userPermissions.address && (
            <p className="text-sm text-gray-600 mt-1">
              Connected: {formatAddress(userPermissions.address)}
              {userPermissions.isInitialSuperAdmin ? (
                <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  Initial Super Admin
                </span>
              ) : userPermissions.isSuperAdmin ? (
                <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  Super Admin
                </span>
              ) : userPermissions.isAdmin ? (
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  Admin
                </span>
              ) : null}
            </p>
          )}
        </div>

        <button
          onClick={refreshAdminData}
          disabled={
            loading.loadingAdmins || loading.checkingPermissions
          }
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          aria-label="Refresh admin data"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading.loadingAdmins || loading.checkingPermissions
                ? 'animate-spin'
                : ''
            }`}
            aria-hidden="true"
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <StatCard
          icon={<Building className="h-8 w-8" />}
          title="Total Projects"
          value={projects.length.toString()}
          change={`+${Math.floor(projects.length * 0.125)}`}
          color="blue"
          loading={loading.loadingProjects}
        />
        <StatCard
          icon={<CheckCircle className="h-8 w-8" />}
          title="Approved Projects"
          value={approvedProjects.toString()}
          change={`+${Math.floor(approvedProjects * 0.11)}`}
          color="green"
          loading={loading.loadingProjects}
        />
        <StatCard
          icon={<Award className="h-8 w-8" />}
          title="IREC Tokens"
          value={totalIRECs.toString()}
          change="+5"
          color="purple"
          loading={loading.loadingIRECs}
        />
        <StatCard
          icon={<DollarSign className="h-8 w-8" />}
          title="Total Energy"
          value={totalEnergy.toString()}
          change="+120"
          color="yellow"
          loading={loading.loadingIRECs}
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
        <nav className="flex space-x-1 px-6" role="tablist">
          <TabButton
            tab="overview"
            label="Overview"
            icon={<Database className="h-4 w-4" />}
          />
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
            disabled={!userPermissions.isInitialSuperAdmin}
          />
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-lg shadow-md">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              System Overview
            </h3>
            {!userPermissions.isAdmin &&
              !userPermissions.isInitialSuperAdmin &&
              !userPermissions.isSuperAdmin && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <p className="font-medium text-yellow-800">
                      Limited Access
                    </p>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    You currently have read-only access.
                  </p>
                </div>
              )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">
                  Recent Activity
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Project Approved
                      </p>
                      <p className="text-xs text-gray-600">
                        Green Solar Farm - 2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Award className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        IREC Token Minted
                      </p>
                      <p className="text-xs text-gray-600">
                        Token #127 - 4 hours ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">
                  System Status
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-700">
                        Blockchain Connection
                      </span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-700">IPFS Gateway</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      Operational
                    </span>
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
              <h3 className="text-lg font-semibold text-gray-900">
                Project Management
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter project address (0x...)"
                  value={approvalForm.projectAddress}
                  onChange={(e) =>
                    setApprovalForm({ projectAddress: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Project address"
                />
                <ActionButton
                  onClick={handleApproveProjectByAddress}
                  disabled={loading.approving.has(
                    approvalForm.projectAddress
                  )}
                  loading={loading.approving.has(
                    approvalForm.projectAddress
                  )}
                  loadingText="Approving..."
                  variant="success"
                  size="md"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Approve</span>
                </ActionButton>
              </div>
            </div>
            {loading.loadingProjects ? (
              <div className="p-6 text-center text-gray-600">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No projects available.
              </div>
            ) : (
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
                      <tr
                        key={project.address}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {project.name}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {project.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {project.address.slice(0, 6)}...
                            {project.address.slice(-4)}
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
                            <ActionButton
                              onClick={() =>
                                handleApproveProject(project.address)
                              }
                              disabled={loading.approving.has(
                                project.address
                              )}
                              loading={loading.approving.has(
                                project.address
                              )}
                              loadingText="Approving..."
                              variant="success"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span>Approve</span>
                            </ActionButton>
                          ) : (
                            <ActionButton
                              onClick={() =>
                                handleRevokeProject(project.address)
                              }
                              disabled={loading.approving.has(
                                project.address
                              )}
                              loading={loading.approving.has(
                                project.address
                              )}
                              loadingText="Revoking..."
                              variant="warning"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              <span>Revoke</span>
                            </ActionButton>
                          )}
                          {(userPermissions.isSuperAdmin ||
                            userPermissions.isInitialSuperAdmin) && (
                            <ActionButton
                              onClick={() =>
                                handleRemoveProject(project.address)
                              }
                              variant="danger"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              <span>Remove</span>
                            </ActionButton>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* IRECs Tab */}
        {activeTab === 'irecs' && userPermissions.canMintTokens && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                IREC Token Management
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg w-full md:w-1/3">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Mint New IREC Token
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={mintForm.projectAddress}
                    onChange={(e) =>
                      setMintForm((prev) => ({
                        ...prev,
                        projectAddress: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Select project"
                  >
                    <option value="">Select Project</option>
                    {projects
                      .filter((p) => p.approved)
                      .map((project) => (
                        <option
                          key={project.address}
                          value={project.address}
                        >
                          {project.name}
                        </option>
                      ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Metadata URI"
                    value={mintForm.metadataURI}
                    onChange={(e) =>
                      setMintForm((prev) => ({
                        ...prev,
                        metadataURI: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Metadata URI"
                  />
                  <input
                    type="number"
                    placeholder="Energy Amount (MWh)"
                    value={mintForm.energyAmount}
                    onChange={(e) =>
                      setMintForm((prev) => ({
                        ...prev,
                        energyAmount: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Energy amount in MWh"
                  />
                </div>
                <div className="mt-3 w-full">
                  <ActionButton
                    onClick={handleMintIREC}
                    disabled={loading.minting.has(
                      mintForm.projectAddress
                    )}
                    loading={loading.minting.has(
                      mintForm.projectAddress
                    )}
                    loadingText="Minting..."
                    variant="primary"
                    size="md"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    <span>Mint IREC Token</span>
                  </ActionButton>
                </div>
              </div>
            </div>
            {loading.loadingIRECs ? (
              <div className="p-6 text-center text-gray-600">
                Loading IREC tokens...
              </div>
            ) : irecs.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No IREC tokens available.
              </div>
            ) : (
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
                      <tr
                        key={irec.tokenId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{irec.tokenId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {irec.projectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                            {formatAddress(irec.owner)}
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
            )}
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && userPermissions.canGrantRoles && (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Admin Management
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg w-full md:w-1/3">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Add New Admin
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ethereum Address (0x...)"
                    value={newAdminForm.address}
                    onChange={(e) =>
                      setNewAdminForm({
                        ...newAdminForm,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Admin Ethereum address"
                  />
                  <select
                    value={newAdminForm.role}
                    onChange={(e) =>
                      setNewAdminForm({
                        ...newAdminForm,
                        role: e.target.value as
                          | 'ADMIN_ROLE'
                          | 'DEFAULT_ADMIN_ROLE',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Admin role"
                  >
                    <option value="ADMIN_ROLE">Regular Admin</option>
                    <option value="DEFAULT_ADMIN_ROLE">Super Admin</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Admin Name"
                    value={newAdminForm.name}
                    onChange={(e) =>
                      setNewAdminForm({
                        ...newAdminForm,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Admin name"
                  />
                  <ActionButton
                    onClick={() => handleGrantRole(newAdminForm.role)}
                    disabled={
                      loading.grantingRole.has(newAdminForm.address) ||
                      !userPermissions.canGrantRoles
                    }
                    loading={loading.grantingRole.has(
                      newAdminForm.address
                    )}
                    loadingText="Adding Admin..."
                    variant="success"
                    size="md"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Add Admin</span>
                  </ActionButton>
                </div>
              </div>
            </div>
            {loading.loadingAdmins ? (
              <div className="p-6 text-center text-gray-600">
                Loading admin data...
              </div>
            ) : admins.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No admins available.
              </div>
            ) : (
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
                      <tr
                        key={admin.address}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.name}
                          </div>
                          <div className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {formatAddress(admin.address)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              admin.isSuperAdmin ||
                              admin.isInitialSuperAdmin
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          N/A
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {(userPermissions.isSuperAdmin ||
                            userPermissions.isInitialSuperAdmin) &&
                            admin.address.toLowerCase() !==
                              userPermissions.address?.toLowerCase() && (
                              <ActionButton
                                onClick={() =>
                                  handleRevokeRole(
                                    admin.address,
                                    admin.isSuperAdmin
                                  )
                                }
                                disabled={loading.revokingRole.has(
                                  admin.address
                                )}
                                loading={loading.revokingRole.has(
                                  admin.address
                                )}
                                loadingText="Revoking..."
                                variant="danger"
                                size="sm"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                <span>Revoke</span>
                              </ActionButton>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && userPermissions.isInitialSuperAdmin && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Platform Settings
            </h3>
            <div className="space-y-6 max-w-2xl">
              <div>
                <label
                  htmlFor="baseTokenURI"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Base Token URI
                </label>
                <input
                  id="baseTokenURI"
                  type="text"
                  value={platformSettings.baseTokenURI}
                  onChange={(e) =>
                    handleSettingsChange('baseTokenURI', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  aria-label="Base token URI"
                />
              </div>
              <div>
                <label
                  htmlFor="platformFee"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Platform Fee (%)
                </label>
                <input
                  id="platformFee"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={platformSettings.platformFee}
                  onChange={(e) =>
                    handleSettingsChange('platformFee', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  aria-label="Platform fee percentage"
                />
              </div>
              <div>
                <label
                  htmlFor="minEnergyPerToken"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Minimum Energy per Token (MWh)
                </label>
                <input
                  id="minEnergyPerToken"
                  type="number"
                  value={platformSettings.minEnergyPerToken}
                  onChange={(e) =>
                    handleSettingsChange(
                      'minEnergyPerToken',
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  aria-label="Minimum energy per token in MWh"
                />
              </div>
              <div>
                <label
                  htmlFor="contractAddress"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contract Address
                </label>
                <input
                  id="contractAddress"
                  type="text"
                  readOnly
                  value={platformSettings.contractAddress}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed sm:text-sm"
                  aria-label="Contract address (read-only)"
                />
              </div>
              <div className="mt-4">
                <ActionButton
                  onClick={saveSettings}
                  disabled={loading.savingSettings}
                  loading={loading.savingSettings}
                  loadingText="Saving..."
                  variant="primary"
                  size="md"
                >
                  Save Changes
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IRECAdminDashboard;