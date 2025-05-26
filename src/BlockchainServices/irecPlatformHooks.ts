import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from 'viem/chains';
import type { WalletClient } from 'viem';
import {
   IrecNFTAddress,
   IrecNFTABI,
    MarketplaceAddress,
    marketplaceABI,
    FractionalizationAddress,
    fractionalizationABI
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
      if (error.message.includes("SUPER_ADMIN_ROLE")) {
        errorMessage = "Access denied: Only super admins can grant admin roles";
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else if (error.message.includes("Invalid account address")) {
        errorMessage = "Invalid account address provided";
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
      if (error.message.includes("INITIAL_SUPER_ADMIN_ROLE")) {
        errorMessage = "Access denied: Only the initial super admin can grant super admin roles";
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else if (error.message.includes("Invalid account address")) {
        errorMessage = "Invalid account address provided";
      } else if (error.message.includes("Cannot grant role to initial super admin again")) {
        errorMessage = "Cannot grant super admin role to the initial super admin again";
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
      if (error.message.includes("SUPER_ADMIN_ROLE")) {
        errorMessage = "Access denied: Only super admins can revoke admin roles";
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else if (error.message.includes("Cannot revoke role from initial super admin")) {
        errorMessage = "Cannot revoke admin role from the initial super admin";
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
      if (error.message.includes("INITIAL_SUPER_ADMIN_ROLE")) {
        errorMessage = "Access denied: Only the initial super admin can revoke super admin roles";
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else if (error.message.includes("Cannot revoke role from initial super admin")) {
        errorMessage = "Cannot revoke super admin role from the initial super admin";
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
 * Check if an address is the initial super admin
 */
export async function isInitialSuperAdmin(accountAddress: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    
    const result = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'isInitialSuperAdmin',
      args: [accountAddress],
    });

    return result as boolean;
  } catch (error) {
    console.error("Error checking initial super admin status:", error);
    return false;
  }
}

/**
 * Get the initial super admin address
 */
export async function getInitialSuperAdmin(): Promise<`0x${string}` | null> {
  try {
    const publicClient = getPublicClient();
    
    const result = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'getInitialSuperAdmin',
    });

    return result as `0x${string}`;
  } catch (error) {
    console.error("Error getting initial super admin:", error);
    return null;
  }
}

/**
 * Check current user's admin permissions
 */
export async function getCurrentUserPermissions(): Promise<{
  address: `0x${string}` | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInitialSuperAdmin: boolean;
  error?: string;
}> {
  try {
    const { address } = await getWalletClient();
    
    const [adminStatus, superAdminStatus, initialSuperAdminStatus] = await Promise.all([
      isAdmin(address as `0x${string}`),
      isSuperAdmin(address as `0x${string}`),
      isInitialSuperAdmin(address as `0x${string}`)
    ]);

    return {
      address: address as `0x${string}`,
      isAdmin: adminStatus,
      isSuperAdmin: superAdminStatus,
      isInitialSuperAdmin: initialSuperAdminStatus
    };
  } catch (error) {
    console.error("Error getting current user permissions:", error);
    return {
      address: null,
      isAdmin: false,
      isSuperAdmin: false,
      isInitialSuperAdmin: false,
      error: error instanceof Error ? error.message : "Failed to get permissions"
    };
  }
}

// ============ OPTIMIZED PERMISSION FUNCTIONS ============

/**
 * Check current user's permissions specifically for role granting operations
 * This is a lightweight version focused only on what's needed for role management UI
 */
export async function getRoleGrantingPermissions(): Promise<{
  address: `0x${string}` | null;
  canGrantAdmin: boolean;
  canGrantSuperAdmin: boolean;
  error?: string;
}> {
  try {
    const { address } = await getWalletClient();
    
    if (!address) {
      return {
        address: null,
        canGrantAdmin: false,
        canGrantSuperAdmin: false,
        error: "Wallet not connected"
      };
    }
    // Only check the permissions needed for granting roles
    // Super admins can grant admin roles
    // Initial super admin can grant super admin roles
    const [isSuperAdminStatus, isInitialSuperAdminStatus] = await Promise.all([
      isSuperAdmin(address as `0x${string}`),
      isInitialSuperAdmin(address as `0x${string}`)
    ]);
    return {
      address: address as `0x${string}`,
      canGrantAdmin: isSuperAdminStatus, // Super admins can grant admin roles
      canGrantSuperAdmin: isInitialSuperAdminStatus, // Only initial super admin can grant super admin roles
    };
  } catch (error) {
    console.error("Error getting role granting permissions:", error);
    return {
      address: null,
      canGrantAdmin: false,
      canGrantSuperAdmin: false,
      error: error instanceof Error ? error.message : "Failed to get permissions"
    };
  }
}

/**
 * Lightweight check - just see if user can perform any admin actions
 * Useful for showing/hiding admin UI elements
 */
export async function canUserPerformAdminActions(): Promise<boolean> {
  try {
    const { address } = await getWalletClient();
    if (!address) return false;
    
    return await isAdmin(address as `0x${string}`);
  } catch (error) {
    console.error("Error checking admin permissions:", error);
    return false;
  }
}

/**
 * Even more lightweight - just check if wallet is connected and get address
 * Use this for basic UI state management
 */
export async function getConnectedAddress(): Promise<`0x${string}` | null> {
  try {
    const { address } = await getWalletClient();
    return address as `0x${string}` | null;
  } catch (error) {
    console.error("Error getting connected address:", error);
    return null;
  }
}

/**
 * Check specific permission without multiple calls
 * Use this when you need to check just one permission
 */
export async function checkSpecificPermission(
  permission: 'admin' | 'superAdmin' | 'initialSuperAdmin'
): Promise<boolean> {
  try {
    const { address } = await getWalletClient();
    if (!address) return false;
    
    switch (permission) {
      case 'admin':
        return await isAdmin(address as `0x${string}`);
      case 'superAdmin':
        return await isSuperAdmin(address as `0x${string}`);
      case 'initialSuperAdmin':
        return await isInitialSuperAdmin(address as `0x${string}`);
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking ${permission} permission:`, error);
    return false;
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
      const [adminStatus, superAdminStatus, initialSuperAdminStatus] = await Promise.all([
        isAdmin(address),
        isSuperAdmin(address),
        isInitialSuperAdmin(address)
      ]);

      return {
        address,
        isAdmin: adminStatus,
        isSuperAdmin: superAdminStatus,
        isInitialSuperAdmin: initialSuperAdminStatus
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

// ============ LEGACY/DEPRECATED FUNCTIONS ============
// These functions are kept for backward compatibility but the optimized versions above are preferred

/**
 * Check if current user can perform admin actions
 * @deprecated Use canUserPerformAdminActions() instead for better performance
 */
export async function canPerformAdminActions(): Promise<boolean> {
  const { isAdmin: adminStatus } = await getCurrentUserPermissions();
  return adminStatus;
}

/**
 * Check if current user can perform super admin actions
 * @deprecated Use checkSpecificPermission('superAdmin') instead for better performance
 */
export async function canPerformSuperAdminActions(): Promise<boolean> {
  const { isSuperAdmin: superAdminStatus } = await getCurrentUserPermissions();
  return superAdminStatus;
}

// ============ IREC MINTING FUNCTION ============

//mint irec nft
export async function mintIREC(
  projectAddress: `0x${string}`,
  metadataURI: string
): Promise<{ success: boolean; hash?: `0x${string}`; tokenId?: string; error?: string }> {
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
      functionName: 'mintIREC',
      args: [projectAddress, metadataURI],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    // Wait for transaction confirmation
    const publicClient = getPublicClient()
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    })

    if (receipt.status === 'success') {
      
      let tokenId: string | undefined;
      
      // Parse the logs to get the token ID from IRECMinted event
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          
          const mintEvent = receipt.logs.find(log => 
            log.topics[0] === '0x...' //
          );
          
          if (mintEvent) {
            // Decode the token ID from the event data
            // tokenId = decodeEventLog({ ... });
          }
        } catch (logError) {
          console.warn("Could not parse token ID from transaction logs:", logError);
        }
      }

      return { success: true, hash, tokenId }
    } else {
      throw new Error("Transaction failed")
    }
   } catch (error) {
    console.error("Error minting IREC:", error)
         
    let errorMessage = "Failed to mint IREC NFT"
    if (error instanceof Error) {
      if (error.message.includes("ADMIN_ROLE")) {
        errorMessage = "Access denied: Only admins can mint IREC NFTs"
      } else if (error.message.includes("Project not approved")) {
        errorMessage = "Project is not approved for minting"
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else {
        errorMessage = error.message
      }
    }
         
    return { success: false, error: errorMessage }
  }
}

// ============ TYPE DEFINITIONS ============

export interface AdminInfo {
  address: `0x${string}`;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInitialSuperAdmin: boolean;
}

export interface TransactionResult {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
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
//list NFTs
export async function listNFT(
  tokenId: bigint,
  price: bigint,
  totalEnergy: bigint,
  energyPerToken: bigint,
  tokenName: string,
  tokenSymbol: string
): Promise<{ success: boolean; hash?: `0x${string}`; listingId?: string; error?: string }> {
  try {
    // Get wallet client
    const { walletClient, address } = await getWalletClient()
         
    if (!walletClient) {
      throw new Error("Wallet not connected")
    } 

    // Execute the transaction
    const hash = await walletClient.writeContract({
      address: MarketplaceAddress as `0x${string}`, 
      abi: marketplaceABI, 
      functionName: 'listNFT',
      args: [tokenId, price, totalEnergy, energyPerToken, tokenName, tokenSymbol],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    // Wait for transaction confirmation
    const publicClient = getPublicClient()
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    })

    if (receipt.status === 'success') {
      // Extract listing ID from transaction logs if needed
      let listingId: string | undefined;
      
      // Parse the logs to get the listing ID from NFTListed event
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          
          const listEvent = receipt.logs.find(log => 
            log.topics[0] === '0x...' 
          );
          
          if (listEvent) {
            // Decode the listing ID from the event data
            // listingId = decodeEventLog({ ... });
          }
        } catch (logError) {
          console.warn("Could not parse listing ID from transaction logs:", logError);
        }
      }

      return { success: true, hash, listingId }
    } else {
      throw new Error("Transaction failed")
    }
   } catch (error) {
    console.error("Error listing NFT:", error)
         
    let errorMessage = "Failed to list NFT"
    if (error instanceof Error) {
      if (error.message.includes("Not the owner of the NFT")) {
        errorMessage = "You are not the owner of this NFT"
      } else if (error.message.includes("Price must be greater than zero")) {
        errorMessage = "Price must be greater than zero"
      } else if (error.message.includes("Only approved projects can list assets")) {
        errorMessage = "Only approved projects can list assets"
      } else if (error.message.includes("Marketplace not approved to transfer NFT")) {
        errorMessage = "Please approve the marketplace to transfer your NFT first"
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else {
        errorMessage = error.message
      }
    }
         
    return { success: false, error: errorMessage }
  }
}
//buy NFT
export async function purchaseNFT(
  listingId: bigint,
  isFractional: boolean,
  amount: bigint,
  paymentAmount: bigint
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> {
  try {
    // Get wallet client
    const { walletClient, address } = await getWalletClient()
         
    if (!walletClient) {
      throw new Error("Wallet not connected")
    } 

    // Execute the transaction
    const hash = await walletClient.writeContract({
      address: MarketplaceAddress as `0x${string}`, 
      abi: marketplaceABI, 
      functionName: 'purchaseNFT',
      args: [listingId, isFractional, amount],
      value: paymentAmount, 
      chain: sepolia,
      account: address as `0x${string}`,
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
    console.error("Error purchasing NFT:", error)
         
    let errorMessage = "Failed to purchase NFT"
    if (error instanceof Error) {
      if (error.message.includes("Listing not active")) {
        errorMessage = "This listing is no longer active"
      } else if (error.message.includes("Cannot buy your own listing")) {
        errorMessage = "You cannot purchase your own listing"
      } else if (error.message.includes("Amount must be greater than zero")) {
        errorMessage = "Purchase amount must be greater than zero"
      } else if (error.message.includes("NFT has no energy value for fractionalization")) {
        errorMessage = "This NFT cannot be purchased fractionally (no energy value)"
      } else if (error.message.includes("NFT has no energy per token value for fractionalization")) {
        errorMessage = "This NFT cannot be purchased fractionally (no energy per token value)"
      } else if (error.message.includes("Insufficient payment")) {
        errorMessage = "Insufficient payment amount"
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH balance"
      } else {
        errorMessage = error.message
      }
    }
         
    return { success: false, error: errorMessage }
  }
}

// Helper function to calculate required payment before calling purchaseNFT
export async function calculateRequiredPayment(
  listingId: bigint,
  isFractional: boolean,
  amount: bigint
): Promise<{ success: boolean; requiredPayment?: bigint; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    // Read listing data from contract
    interface Listing {
      price: bigint;
      totalEnergy: bigint;
      energyPerToken: bigint;
      active: boolean;
      
    }

    const listing = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'listings',
      args: [listingId],
    }) as Listing;
    
    if (!listing.active) {
      throw new Error("Listing not active")
    }
    
    let requiredPayment: bigint;
    
    if (isFractional) {
      if (amount <= 0n) {
        throw new Error("Amount must be greater than zero")
      }
      if (listing.totalEnergy <= 0n) {
        throw new Error("NFT has no energy value for fractionalization")
      }
      if (listing.energyPerToken <= 0n) {
        throw new Error("NFT has no energy per token value for fractionalization")
      }
      
      const totalTokens = listing.totalEnergy / listing.energyPerToken;
      const pricePerToken = listing.price / totalTokens;
      requiredPayment = pricePerToken * amount;
    } else {
      requiredPayment = listing.price;
    }
    
    return { success: true, requiredPayment }
  } catch (error) {
    console.error("Error calculating required payment:", error)
    
    let errorMessage = "Failed to calculate required payment"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return { success: false, error: errorMessage }
  }
}
//Fractionalize NFT
export async function fractionalize(
  tokenId: bigint,
  totalEnergy: bigint,
  energyPerToken: bigint,
  tokenName: string,
  tokenSymbol: string
): Promise<{ success: boolean; hash?: `0x${string}`; fractionalTokenAddress?: `0x${string}`; error?: string }> {
  try {
    // Get wallet client
    const { walletClient, address } = await getWalletClient()
         
    if (!walletClient) {
      throw new Error("Wallet not connected")
    } 

    // Execute the transaction
    const hash = await walletClient.writeContract({
      address: FractionalizationAddress as `0x${string}`, // Replace with your fractionalization contract address
      abi: fractionalizationABI, // Replace with your fractionalization contract ABI
      functionName: 'fractionalize',
      args: [tokenId, totalEnergy, energyPerToken, tokenName, tokenSymbol],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    // Wait for transaction confirmation
    const publicClient = getPublicClient()
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    })

    if (receipt.status === 'success') {
      // Extract fractional token address from transaction logs
      let fractionalTokenAddress: `0x${string}` | undefined;
      
      // Parse the logs to get the token address from NFTFractionalized event
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          // This assumes you have the event ABI to decode the logs
          // You might need to adjust this based on your event structure
          const fractionalizeEvent = receipt.logs.find(log => 
            log.topics[0] === '0x...' // Replace with actual NFTFractionalized event signature hash
          );
          
          if (fractionalizeEvent) {
            // Decode the fractional token address from the event data
            // fractionalTokenAddress = decodeEventLog({ ... });
          }
        } catch (logError) {
          console.warn("Could not parse fractional token address from transaction logs:", logError);
        }
      }

      return { success: true, hash, fractionalTokenAddress }
    } else {
      throw new Error("Transaction failed")
    }
   } catch (error) {
    console.error("Error fractionalizing NFT:", error)
         
    let errorMessage = "Failed to fractionalize NFT"
    if (error instanceof Error) {
      if (error.message.includes("NFT already fractionalized")) {
        errorMessage = "This NFT has already been fractionalized"
      } else if (error.message.includes("Not the owner of the NFT")) {
        errorMessage = "You are not the owner of this NFT"
      } else if (error.message.includes("Not an approved project")) {
        errorMessage = "Only approved projects can fractionalize NFTs"
      } else if (error.message.includes("Invalid energy value")) {
        errorMessage = "Energy value must be greater than zero"
      } else if (error.message.includes("Minimum energy per token is 50kW")) {
        errorMessage = "Minimum energy per token is 50kW"
      } else if (error.message.includes("Energy per token exceeds total energy")) {
        errorMessage = "Energy per token cannot exceed total energy"
      } else if (error.message.includes("Energy per token must divide total energy evenly")) {
        errorMessage = "Energy per token must divide total energy evenly"
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else {
        errorMessage = error.message
      }
    }
         
    return { success: false, error: errorMessage }
  }
}

// Helper function to validate fractionalization parameters before transaction
export async function validateFractionalizationParams(
  tokenId: bigint,
  totalEnergy: bigint,
  energyPerToken: bigint,
  userAddress: `0x${string}`
): Promise<{ success: boolean; tokenCount?: bigint; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    // Check if NFT is already fractionalized
    const existingFractionalToken = await publicClient.readContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI,
      functionName: 'nftToFractionalToken',
      args: [tokenId],
    }) as `0x${string}`
    
    if (existingFractionalToken !== '0x0000000000000000000000000000000000000000') {
      throw new Error("NFT already fractionalized")
    }
    
    // Check NFT ownership
    const owner = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'ownerOf',
      args: [tokenId],
    }) as `0x${string}`
    
    if (owner.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error("Not the owner of the NFT")
    }
    
    // Check if user is approved project
    const isApproved = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'isApprovedProject',
      args: [userAddress],
    }) as boolean
    
    if (!isApproved) {
      throw new Error("Not an approved project")
    }
    
    // Validate energy parameters
    if (totalEnergy <= 0n) {
      throw new Error("Invalid energy value")
    }
    
    const MIN_ENERGY_PER_TOKEN = 50n; // Assuming 50kW minimum
    if (energyPerToken < MIN_ENERGY_PER_TOKEN) {
      throw new Error("Minimum energy per token is 50kW")
    }
    
    if (energyPerToken > totalEnergy) {
      throw new Error("Energy per token exceeds total energy")
    }
    
    if (totalEnergy % energyPerToken !== 0n) {
      throw new Error("Energy per token must divide total energy evenly")
    }
    
    const tokenCount = totalEnergy / energyPerToken;
    
    return { success: true, tokenCount }
  } catch (error) {
    console.error("Error validating fractionalization parameters:", error)
    
    let errorMessage = "Failed to validate parameters"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return { success: false, error: errorMessage }
  }
}
//Redeem NFT
export async function redeem(
  fractionalTokenAddress: `0x${string}`
): Promise<{ success: boolean; hash?: `0x${string}`; nftId?: string; error?: string }> {
  try {
    // Get wallet client
    const { walletClient, address } = await getWalletClient()
         
    if (!walletClient) {
      throw new Error("Wallet not connected")
    } 

    // Execute the transaction
    const hash = await walletClient.writeContract({
      address: FractionalizationAddress as `0x${string}`, // Replace with your fractionalization contract address
      abi: fractionalizationABI, // Replace with your fractionalization contract ABI
      functionName: 'redeem',
      args: [fractionalTokenAddress],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    // Wait for transaction confirmation
    const publicClient = getPublicClient()
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    })

    if (receipt.status === 'success') {
      // Extract NFT ID from transaction logs
      let nftId: string | undefined;
      
      // Parse the logs to get the NFT ID from NFTRedeemed event
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          // This assumes you have the event ABI to decode the logs
          // You might need to adjust this based on your event structure
          const redeemEvent = receipt.logs.find(log => 
            log.topics[0] === '0x...' // Replace with actual NFTRedeemed event signature hash
          );
          
          if (redeemEvent) {
            // Decode the NFT ID from the event data
            // nftId = decodeEventLog({ ... });
          }
        } catch (logError) {
          console.warn("Could not parse NFT ID from transaction logs:", logError);
        }
      }

      return { success: true, hash, nftId }
    } else {
      throw new Error("Transaction failed")
    }
   } catch (error) {
    console.error("Error redeeming NFT:", error)
         
    let errorMessage = "Failed to redeem NFT"
    if (error instanceof Error) {
      if (error.message.includes("Invalid token address")) {
        errorMessage = "Invalid fractional token address"
      } else if (error.message.includes("Token not linked to any NFT")) {
        errorMessage = "This token is not linked to any NFT"
      } else if (error.message.includes("Must own all fractional tokens")) {
        errorMessage = "You must own all fractional tokens to redeem the NFT"
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else {
        errorMessage = error.message
      }
    }
         
    return { success: false, error: errorMessage }
  }
}

// Helper function to validate redemption eligibility before transaction
export async function validateRedemption(
  fractionalTokenAddress: `0x${string}`,
  userAddress: `0x${string}`
): Promise<{ 
  success: boolean; 
  nftId?: bigint; 
  userBalance?: bigint; 
  totalSupply?: bigint; 
  canRedeem?: boolean;
  error?: string 
}> {
  try {
    const publicClient = getPublicClient()
    
    // Validate token address
    if (fractionalTokenAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error("Invalid token address")
    }
    
    // Get NFT ID linked to this token
    const nftId = await publicClient.readContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI,
      functionName: 'tokenToNFT',
      args: [fractionalTokenAddress],
    }) as bigint
    
    // Verify reverse mapping (token is actually linked to an NFT)
    const linkedToken = await publicClient.readContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI,
      functionName: 'nftToFractionalToken',
      args: [nftId],
    }) as `0x${string}`
    
    if (linkedToken.toLowerCase() !== fractionalTokenAddress.toLowerCase()) {
      throw new Error("Token not linked to any NFT")
    }
    
    // Get user's fractional token balance
    const userBalance = await publicClient.readContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI, 
      functionName: 'balanceOf',
      args: [userAddress],
    }) as bigint
    
    // Get total supply of fractional tokens
    const totalSupply = await publicClient.readContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI,
      functionName: 'totalSupply',
      args: [],
    }) as bigint
    
    // Check if user owns all tokens
    const canRedeem = userBalance === totalSupply;
    
    if (!canRedeem) {
      throw new Error("Must own all fractional tokens")
    }
    
    return { 
      success: true, 
      nftId, 
      userBalance, 
      totalSupply, 
      canRedeem: true 
    }
  } catch (error) {
    console.error("Error validating redemption:", error)
    
    let errorMessage = "Failed to validate redemption"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return { success: false, error: errorMessage }
  }
}

// Helper function to get fractional token info
export async function getFractionalToken(
  fractionalTokenAddress: `0x${string}`
): Promise<{ 
  success: boolean; 
  name?: string; 
  symbol?: string; 
  totalSupply?: bigint;
  nftId?: bigint;
  energyPerToken?: bigint;
  totalEnergy?: bigint;
  error?: string 
}> {
  try {
    const publicClient = getPublicClient()
    
    // Get basic ERC-20 info
    const [name, symbol, totalSupply] = await Promise.all([
      publicClient.readContract({
        address: FractionalizationAddress as `0x${string}`,
        abi: fractionalizationABI,
        functionName: 'name',
        args: [],
      }) as Promise<string>,
      publicClient.readContract({
        address: FractionalizationAddress as `0x${string}`,
        abi: fractionalizationABI,
        functionName: 'symbol',
        args: [],
      }) as Promise<string>,
      publicClient.readContract({
        address: FractionalizationAddress as `0x${string}`,
        abi: fractionalizationABI,
        functionName: 'totalSupply',
        args: [],
      }) as Promise<bigint>
    ]);
    
    // Get NFT ID
    const nftId = await publicClient.readContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI,
      functionName: 'tokenToNFT',
      args: [fractionalTokenAddress],
    }) as bigint
    
    // Get energy info (assuming these are available in your fractional token contract)
    const [energyPerToken, totalEnergy] = await Promise.all([
      publicClient.readContract({
        address: FractionalizationAddress as `0x${string}`,
        abi: fractionalizationABI,
        functionName: 'energyPerToken',
        args: [],
      }) as Promise<bigint>,
      publicClient.readContract({
        address: FractionalizationAddress as `0x${string}`,
        abi: fractionalizationABI,
        functionName: 'totalEnergy',
        args: [],
      }) as Promise<bigint>
    ]);
    
    return { 
      success: true, 
      name, 
      symbol, 
      totalSupply, 
      nftId, 
      energyPerToken, 
      totalEnergy 
    }
  } catch (error) {
    console.error("Error getting fractional token info:", error)
    
    let errorMessage = "Failed to get token information"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return { success: false, error: errorMessage }
  }
}