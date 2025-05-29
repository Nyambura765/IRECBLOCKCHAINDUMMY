

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface AdminInfo {
  address: string;
  name?: string; 
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

// Role constants 
export const ROLE_TYPES = {
  ADMIN_ROLE: 'ADMIN_ROLE',
  DEFAULT_ADMIN_ROLE: 'DEFAULT_ADMIN_ROLE', // Super Admin
  INITIAL_SUPER_ADMIN_ROLE: 'INITIAL_SUPER_ADMIN_ROLE'
} as const;

export type RoleType = typeof ROLE_TYPES[keyof typeof ROLE_TYPES];

// Error types 
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