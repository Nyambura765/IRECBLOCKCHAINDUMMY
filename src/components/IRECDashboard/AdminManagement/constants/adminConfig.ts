// constants/adminConfig.ts

// Define EthereumAddress type locally since it's not available in ../types
export type EthereumAddress = `0x${string}`;

// Initial Super Admin - this should be the deployer's address or a designated admin address
export const INITIAL_SUPER_ADMIN_ADDRESS: EthereumAddress = "0x38479916d1FB20031449Ef2f0bAfeba74Bd34710"; 

// Role constants that match your smart contract
export const ADMIN_ROLES = {
  DEFAULT_ADMIN_ROLE: 'DEFAULT_ADMIN_ROLE', // Super Admin role
  ADMIN_ROLE: 'ADMIN_ROLE',                 // Regular Admin role
} as const;

// Helper function to check if an address is the initial super admin
export const isInitialSuperAdmin = (address: EthereumAddress | null): boolean => {
  if (!address) return false;
  return address.toLowerCase() === INITIAL_SUPER_ADMIN_ADDRESS.toLowerCase();
};

// Helper function to determine user permissions based on their role and address
export const getUserPermissions = (
  userAddress: EthereumAddress | null,
  isAdmin: boolean,
  isSuperAdmin: boolean
) => {
  const isInitialAdmin = isInitialSuperAdmin(userAddress);
  
  return {
    address: userAddress,
    isAdmin,
    isSuperAdmin,
    isInitialSuperAdmin: isInitialAdmin,
    canGrantAdmin: isSuperAdmin || isInitialAdmin,      // Super admins can grant admin roles
    canGrantSuperAdmin: isInitialAdmin,                 // Only initial super admin can grant super admin roles
    canGrantRoles: isSuperAdmin || isInitialAdmin,
    canApproveProjects: isAdmin || isSuperAdmin || isInitialAdmin,
    canMintTokens: isAdmin || isSuperAdmin || isInitialAdmin,
  };
};

// Type definitions for Admin Management system

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface AdminInfo {
  address: string;
  name?: string; // Made optional to fix the type error
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInitialSuperAdmin: boolean;
}

export interface UserPermissions {
  address: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInitialSuperAdmin: boolean;
  canGrantAdmin: boolean;
  canGrantSuperAdmin: boolean;
  error?: string;
}

export interface RoleGrantingPermissions {
  address: string | null;
  canGrantAdmin: boolean;
  canGrantSuperAdmin: boolean;
  error?: string;
}

export interface LoadingState {
  grantingRole: Set<string>;
  revokingRole: Set<string>;
  loadingAdmins: boolean;
}

export interface FormData {
  address: string;
  role: string;
  name: string;
}

// Role constants - exported as regular export, not type export
export const ROLE_TYPES = {
  ADMIN_ROLE: 'ADMIN_ROLE',
  DEFAULT_ADMIN_ROLE: 'DEFAULT_ADMIN_ROLE', // Super Admin
  INITIAL_SUPER_ADMIN_ROLE: 'INITIAL_SUPER_ADMIN_ROLE'
} as const;

export type RoleType = typeof ROLE_TYPES[keyof typeof ROLE_TYPES];

// Error types for better error handling
export interface AdminError {
  type: 'PERMISSION_DENIED' | 'INVALID_ADDRESS' | 'TRANSACTION_FAILED' | 'WALLET_NOT_CONNECTED' | 'UNKNOWN';
  message: string;
  originalError?: Error;
}

// Hook return types
export interface UseAdminManagementReturn {
  admins: AdminInfo[];
  userPermissions: UserPermissions;
  loading: LoadingState;
  error: string | null;
  success: string | null;
  grantRole: (address: string, role: RoleType, name: string) => Promise<void>;
  revokeRole: (address: string, isSuper: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
  clearMessages: () => void;
}

// Component props interfaces
export interface AddAdminFormProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onGrantRole: (role: string) => void;
  loading: LoadingState;
  userPermissions: Pick<UserPermissions, 'canGrantAdmin' | 'canGrantSuperAdmin'>;
  className?: string;
}

export interface AdminListProps {
  admins: AdminInfo[];
  userPermissions: Pick<UserPermissions, 'address' | 'isSuperAdmin' | 'isInitialSuperAdmin'>;
  loading: Pick<LoadingState, 'revokingRole'>;
  onRevokeRole: (address: string, isRevokingSuper: boolean) => void;
  formatAddress: (addr: string) => string;
}

// Utility types
export type AdminRole = 'admin' | 'superAdmin' | 'initialSuperAdmin';

export interface AdminStats {
  totalAdmins: number;
  superAdmins: number;
  regularAdmins: number;
  initialSuperAdmin: string | null;
}

// Validation interfaces
export interface AddressValidation {
  isValid: boolean;
  error?: string;
}

export interface FormValidation {
  address: AddressValidation;
  name: { isValid: boolean; error?: string };
  role: { isValid: boolean; error?: string };
  overall: boolean;
}

// Event handlers
export type GrantRoleHandler = (role: string) => void;
export type RevokeRoleHandler = (address: string, isSuper: boolean) => void;
export type FormChangeHandler = (data: FormData) => void;