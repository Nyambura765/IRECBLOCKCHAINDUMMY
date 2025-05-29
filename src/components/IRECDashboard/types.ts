export type EthereumAddress = `0x${string}`;

export interface Project {
  address: EthereumAddress;
  approved: boolean;
  name: string;
  description: string;
  energyGenerated?: number;
  lastActivity?: string;
}

export interface IRECToken {
  tokenId: number;
  owner: EthereumAddress;
  projectAddress: EthereumAddress;
  projectName: string;
  metadataURI: string;
  mintedAt: string;
  energyAmount?: number;
  lastUpdated?: string; 
  status?: StatusType;  
}


export type AdminInfo = {
  address: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInitialSuperAdmin: boolean;
  name?: string;
  lastUpdated?: string;
  roleLevel?: number;
};

export interface LoadingState {
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

export interface UserPermissions {
  address: EthereumAddress | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInitialSuperAdmin: boolean;
  canGrantAdmin: boolean;      // Added missing property
  canGrantSuperAdmin: boolean; // Added missing property
  canGrantRoles: boolean;
  canApproveProjects: boolean;
  canMintTokens: boolean;
}




export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type StatusType = 'success' | 'error' | 'warning' | 'pending' | 'info';
export type ButtonVariant = 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';