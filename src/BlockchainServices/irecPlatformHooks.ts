import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from 'viem/chains';
import type { WalletClient } from 'viem';
import {
   IrecNFTAddress,
   IrecNFTABI,
   // Removed unused imports: FractionalizationAddress, fractionalizationABI, marketplaceABI
} from './core';

//set up public client
function getPublicClient() {
        return createPublicClient({
      chain: sepolia,
      transport: http(`${import.meta.env.VITE_SEP_RPC_URL}`)
    });
}

// Define return type for wallet client
interface WalletClientResult {
    walletClient: WalletClient;
    address: string;
} 

// Type guard to check for ethereum provider
function hasEthereumProvider(window: Window): boolean {
    return window.ethereum !== undefined;

} 

interface AdminInfo {
  address: `0x${string}`;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}


interface TransactionResult {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
}

// Get the wallet client using browser wallet
export async function getWalletClient(): Promise<WalletClientResult> {
    if (!hasEthereumProvider(window)) {
        throw new Error('Please install MetaMask or another web3 wallet');
    } 

    const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum)
    }); 

    const [address] = await walletClient.requestAddresses(); 

    console.log('Connected Address: ', address); 

    return { walletClient, address };
} 

export async function approveProject(
  projectAddress: `0x${string}`
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> {
  try {
    // Get wallet client
    const { walletClient, address } = await getWalletClient()
         
    if (!walletClient) {
      throw new Error("Wallet not connected")
    } 

    // Execute the transaction
    const hash = await walletClient.writeContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'approveProject',
      args: [projectAddress],
      chain: sepolia,
      account: address as `0x${string}`, // Added missing account property with proper type casting
    })

    // Wait for transaction confirmation
    const publicClient = getPublicClient()
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    })

    if (receipt.status === 'success') {
      return { success: true, hash }
    } else {
      throw new Error("Transaction failed")
    }
   } catch (error) {
    console.error("Error approving project:", error)
         
    let errorMessage = "Failed to approve project"
    if (error instanceof Error) {
      if (error.message.includes("ADMIN_ROLE")) {
        errorMessage = "Access denied: Only admins can approve projects"
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else {
        errorMessage = error.message
      }
    }
         
    return { success: false, error: errorMessage }
  }
}
// ============ ROLE GRANTING FUNCTIONS ============

/**
 * Grant admin role to an address
 */
export async function grantAdminRole(
  accountAddress: `0x${string}`
): Promise<TransactionResult> {
  try {
    const { walletClient, address } = await getWalletClient();
    
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    const hash = await walletClient.writeContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'grantAdminRole',
      args: [accountAddress],
      chain: sepolia,
      account: address as `0x${string}`,
    });

    const publicClient = getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      return { success: true, hash };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Error granting admin role:", error);
    
    let errorMessage = "Failed to grant admin role";
    if (error instanceof Error) {
      if (error.message.includes("DEFAULT_ADMIN_ROLE")) {
        errorMessage = "Access denied: Only super admins can grant admin roles";
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else {
        errorMessage = error.message;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Grant super admin role to an address
 */
export async function grantSuperAdminRole(
  accountAddress: `0x${string}`
): Promise<TransactionResult> {
  try {
    const { walletClient, address } = await getWalletClient();
    
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    const hash = await walletClient.writeContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'grantSuperAdminRole',
      args: [accountAddress],
      chain: sepolia,
      account: address as `0x${string}`,
    });

    const publicClient = getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      return { success: true, hash };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Error granting super admin role:", error);
    
    let errorMessage = "Failed to grant super admin role";
    if (error instanceof Error) {
      if (error.message.includes("DEFAULT_ADMIN_ROLE")) {
        errorMessage = "Access denied: Only super admins can grant super admin roles";
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else {
        errorMessage = error.message;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}

// ============ ROLE REVOKING FUNCTIONS ============

/**
 * Revoke admin role from an address
 */
export async function revokeAdminRole(
  accountAddress: `0x${string}`
): Promise<TransactionResult> {
  try {
    const { walletClient, address } = await getWalletClient();
    
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    const hash = await walletClient.writeContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'revokeAdminRole',
      args: [accountAddress],
      chain: sepolia,
      account: address as `0x${string}`,
    });

    const publicClient = getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      return { success: true, hash };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Error revoking admin role:", error);
    
    let errorMessage = "Failed to revoke admin role";
    if (error instanceof Error) {
      if (error.message.includes("DEFAULT_ADMIN_ROLE")) {
        errorMessage = "Access denied: Only super admins can revoke admin roles";
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else {
        errorMessage = error.message;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Revoke super admin role from an address
 */
export async function revokeSuperAdminRole(
  accountAddress: `0x${string}`
): Promise<TransactionResult> {
  try {
    const { walletClient, address } = await getWalletClient();
    
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    const hash = await walletClient.writeContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'revokeSuperAdminRole',
      args: [accountAddress],
      chain: sepolia,
      account: address as `0x${string}`,
    });

    const publicClient = getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      return { success: true, hash };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Error revoking super admin role:", error);
    
    let errorMessage = "Failed to revoke super admin role";
    if (error instanceof Error) {
      if (error.message.includes("DEFAULT_ADMIN_ROLE")) {
        errorMessage = "Access denied: Only super admins can revoke super admin roles";
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else {
        errorMessage = error.message;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}

// ============ ROLE CHECKING FUNCTIONS ============

/**
 * Check if an address has admin role
 */
export async function isAdmin(accountAddress: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    
    const result = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'isAdmin',
      args: [accountAddress],
    });

    return result as boolean;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Check if an address has super admin role
 */
export async function isSuperAdmin(accountAddress: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    
    const result = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'isSuperAdmin',
      args: [accountAddress],
    });

    return result as boolean;
  } catch (error) {
    console.error("Error checking super admin status:", error);
    return false;
  }
}

/**
 * Check current user's admin permissions
 */
export async function getCurrentUserPermissions(): Promise<{
  address: `0x${string}` | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  error?: string;
}> {
  try {
    const { address } = await getWalletClient();
    
    const [adminStatus, superAdminStatus] = await Promise.all([
      isAdmin(address as `0x${string}`),
      isSuperAdmin(address as `0x${string}`)
    ]);

    return {
      address: address as `0x${string}`,
      isAdmin: adminStatus,
      isSuperAdmin: superAdminStatus
    };
  } catch (error) {
    console.error("Error getting current user permissions:", error);
    return {
      address: null,
      isAdmin: false,
      isSuperAdmin: false,
      error: error instanceof Error ? error.message : "Failed to get permissions"
    };
  }
}

// ============ ADMIN LISTING FUNCTIONS ============

/**
 * Get all admin addresses
 */
export async function getAllAdmins(): Promise<`0x${string}`[]> {
  try {
    const publicClient = getPublicClient();
    
    const result = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'getAllAdmins',
    });

    return result as `0x${string}`[];
  } catch (error) {
    console.error("Error getting all admins:", error);
    return [];
  }
}

/**
 * Get all super admin addresses
 */
export async function getAllSuperAdmins(): Promise<`0x${string}`[]> {
  try {
    const publicClient = getPublicClient();
    
    const result = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'getAllSuperAdmins',
    });

    return result as `0x${string}`[];
  } catch (error) {
    console.error("Error getting all super admins:", error);
    return [];
  }
}

/**
 * Get admin count
 */
export async function getAdminCount(): Promise<number> {
  try {
    const publicClient = getPublicClient();
    
    const result = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'getAdminCount',
    });

    return Number(result);
  } catch (error) {
    console.error("Error getting admin count:", error);
    return 0;
  }
}

/**
 * Get super admin count
 */
export async function getSuperAdminCount(): Promise<number> {
  try {
    const publicClient = getPublicClient();
    
    const result = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'getSuperAdminCount',
    });

    return Number(result);
  } catch (error) {
    console.error("Error getting super admin count:", error);
    return 0;
  }
}

/**
 * Get detailed admin information for multiple addresses
 */
export async function getAdminInfo(addresses: `0x${string}`[]): Promise<AdminInfo[]> {
  try {
    const promises = addresses.map(async (address) => {
      const [adminStatus, superAdminStatus] = await Promise.all([
        isAdmin(address),
        isSuperAdmin(address)
      ]);

      return {
        address,
        isAdmin: adminStatus,
        isSuperAdmin: superAdminStatus
      };
    });

    return await Promise.all(promises);
  } catch (error) {
    console.error("Error getting admin info:", error);
    return [];
  }
}

/**
 * Get all admin information (combines addresses with their permissions)
 */
export async function getAllAdminInfo(): Promise<AdminInfo[]> {
  try {
    const [admins, superAdmins] = await Promise.all([
      getAllAdmins(),
      getAllSuperAdmins()
    ]);

    // Combine and deduplicate addresses
    const allAddresses = Array.from(new Set([...admins, ...superAdmins]));
    
    return await getAdminInfo(allAddresses);
  } catch (error) {
    console.error("Error getting all admin info:", error);
    return [];
  }
}

// ============ UTILITY FUNCTIONS ============

/**
 * Validate if an address is a valid Ethereum address
 */
export function isValidAddress(address: string): address is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format address for display (truncate middle)
 */
export function formatAddress(address: `0x${string}`, chars: number = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Check if current user can perform admin actions
 */
export async function canPerformAdminActions(): Promise<boolean> {
  const { isAdmin: adminStatus } = await getCurrentUserPermissions();
  return adminStatus;
}

/**
 * Check if current user can perform super admin actions
 */
export async function canPerformSuperAdminActions(): Promise<boolean> {
  const { isSuperAdmin: superAdminStatus } = await getCurrentUserPermissions();
  return superAdminStatus;
}