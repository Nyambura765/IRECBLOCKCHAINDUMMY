import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from 'viem/chains';
import type { WalletClient } from 'viem';
import {
   IrecNFTAddress,
   IrecNFTABI,
    MarketplaceAddress,
    marketplaceABI,
    FractionalizationAddress,
    fractionalizationABI,
    fractionalTokenABI
} from './core';

//set up public client
function getPublicClient() {
  const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || 
                 'https://eth-sepolia.g.alchemy.com/v2/Sjp-_L06hJaN1mFgjtmEZT-InFB0-rgF';
  
  return createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl)
  });
}
// Define return type for wallet client
interface WalletClientResult {
    walletClient: WalletClient;
    address: string;
} 

// Define TransactionResult type for role management functions
export interface TransactionResult {
    success: boolean;
    hash?: `0x${string}`;
    error?: string;
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

    // Execute the transaction and return hash immediately
    const hash = await walletClient.writeContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'approveProject',
      args: [projectAddress],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    // Return immediately with hash - don't wait for receipt
    return { success: true, hash }
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

    // Return immediately with hash
    return { success: true, hash };
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

    // Return immediately with hash
    return { success: true, hash };
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

    // Return immediately with hash
    return { success: true, hash };
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

    // Return immediately with hash
    return { success: true, hash };
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
// These remain unchanged as they're read operations

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
// These remain unchanged as they're read operations

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
 * AdminInfo interface for admin details
 */
export interface AdminInfo {
  address: `0x${string}`;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInitialSuperAdmin: boolean;
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



export async function listNFT(
  tokenId: bigint,
  price: bigint,
  totalEnergy: bigint,
  energyPerToken: bigint,
  tokenName: string,
  tokenSymbol: string
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> {
  try {
    // Get wallet client
    const { walletClient, address } = await getWalletClient()
         
    if (!walletClient) {
      throw new Error("Wallet not connected")
    } 

    // Execute the transaction and return hash immediately
    const hash = await walletClient.writeContract({
      address: MarketplaceAddress as `0x${string}`, 
      abi: marketplaceABI, 
      functionName: 'listNFT',
      args: [tokenId, price, totalEnergy, energyPerToken, tokenName, tokenSymbol],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    // Return immediately with hash - don't wait for receipt
    return { success: true, hash }
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

    // Execute the transaction and return hash immediately
    const hash = await walletClient.writeContract({
      address: MarketplaceAddress as `0x${string}`, 
      abi: marketplaceABI, 
      functionName: 'purchaseNFT',
      args: [listingId, isFractional, amount],
      value: paymentAmount, 
      chain: sepolia,
      account: address as `0x${string}`,
    })

    // Return immediately with hash - don't wait for receipt
    return { success: true, hash }
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
// Fractionalize NFT Hook
// Fractionalize NFT Hook
export async function fractionalize(
  tokenId: bigint,
  totalEnergy: bigint,
  energyPerToken: bigint,
  tokenName: string,
  tokenSymbol: string
): Promise<{ 
  success: boolean; 
  transactionHash?: `0x${string}`;
  error?: string 
}> {
  try {
    // Get public client for read operations and wallet client for write operations
    const publicClient = getPublicClient()
    const walletClientResult = await getWalletClient()
    
    if (!publicClient || !walletClientResult.walletClient) {
      throw new Error("Client not available")
    }

    const { walletClient, address: account } = walletClientResult

    if (!account) {
      throw new Error("No account connected")
    }

    // First, check if the user owns the NFT
    const nftOwner = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'ownerOf',
      args: [tokenId],
    }) as `0x${string}`

    if (nftOwner.toLowerCase() !== account.toLowerCase()) {
      throw new Error("You don't own this NFT")
    }

    // Check if NFT is already fractionalized
    const existingFractionalToken = await publicClient.readContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI,
      functionName: 'getFractionalTokenAddress',
      args: [tokenId],
    }) as `0x${string}`

    if (existingFractionalToken !== '0x0000000000000000000000000000000000000000') {
      throw new Error("NFT is already fractionalized")
    }

    // Check if the user is an approved project
    const isApproved = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'isApprovedProject',
      args: [account],
    }) as boolean

    if (!isApproved) {
      throw new Error("Not an approved project")
    }

    // Validate energy parameters
    const MIN_ENERGY_PER_TOKEN = 50n
    if (energyPerToken < MIN_ENERGY_PER_TOKEN) {
      throw new Error("Minimum energy per token is 50kW")
    }

    if (totalEnergy < energyPerToken) {
      throw new Error("Energy per token exceeds total energy")
    }

    if (totalEnergy % energyPerToken !== 0n) {
      throw new Error("Energy per token must divide total energy evenly")
    }

    // Check if the fractionalization contract is approved to transfer the NFT
    const approvedAddress = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'getApproved',
      args: [tokenId],
    }) as `0x${string}`

    const isApprovedForAll = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'isApprovedForAll',
      args: [account, FractionalizationAddress as `0x${string}`],
    }) as boolean

    // If not approved, we need to approve first
    if (approvedAddress.toLowerCase() !== (FractionalizationAddress as string).toLowerCase() && !isApprovedForAll) {
      // Approve the fractionalization contract to transfer this specific NFT
      await walletClient.writeContract({
        address: IrecNFTAddress as `0x${string}`,
        abi: IrecNFTABI,
        functionName: 'approve',
        args: [FractionalizationAddress as `0x${string}`, tokenId],
        account: account as `0x${string}`,
        chain: sepolia,
      })
    }

    // Now call the fractionalize function
    const hash = await walletClient.writeContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI,
      functionName: 'fractionalize',
      args: [tokenId, totalEnergy, energyPerToken, tokenName, tokenSymbol],
      account: account as `0x${string}`,
      chain: sepolia,
    })

    // Return immediately with transaction hash
    // Note: The fractionalization contract handles the NFT transfer internally
    return {
      success: true,
      transactionHash: hash,
    }

  } catch (error) {
    console.error("Error fractionalizing NFT:", error)
    
    let errorMessage = "Failed to fractionalize NFT"
    if (error instanceof Error) {
      if (error.message.includes("NFT already fractionalized")) {
        errorMessage = "NFT is already fractionalized"
      } else if (error.message.includes("Not the owner")) {
        errorMessage = "You don't own this NFT"
      } else if (error.message.includes("Not an approved project")) {
        errorMessage = "You are not an approved project"
      } else if (error.message.includes("Minimum energy per token")) {
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

// Helper hook to get NFT energy details
export async function getNFTEnergyDetails(
  tokenId: bigint
): Promise<{ 
  success: boolean; 
  totalEnergy?: bigint;
  fractionalToken?: `0x${string}`;
  tokenCount?: bigint;
  energyPerToken?: bigint;
  error?: string 
}> {
  try {
    const publicClient = getPublicClient()
    
    if (!publicClient) {
      throw new Error("Public client not available")
    }

    const result = await publicClient.readContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI,
      functionName: 'getNFTEnergyDetails',
      args: [tokenId],
    }) as [bigint, `0x${string}`, bigint, bigint]

    const [totalEnergy, fractionalToken, tokenCount, energyPerToken] = result

    return {
      success: true,
      totalEnergy,
      fractionalToken,
      tokenCount,
      energyPerToken
    }

  } catch (error) {
    console.error("Error getting NFT energy details:", error)
    
    let errorMessage = "Failed to get NFT energy details"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return { success: false, error: errorMessage }
  }
}

// Helper hook to set NFT energy value (before fractionalization)
export async function setNFTEnergyValue(
  tokenId: bigint,
  energyValue: bigint
): Promise<{ 
  success: boolean; 
  transactionHash?: `0x${string}`;
  error?: string 
}> {
  try {
    const publicClient = getPublicClient()
    const walletClientResult = await getWalletClient()
    
    if (!publicClient || !walletClientResult.walletClient) {
      throw new Error("Client not available")
    }

    const { walletClient, address: account } = walletClientResult

    if (!account) {
      throw new Error("No account connected")
    }

    // Verify ownership
    const nftOwner = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'ownerOf',
      args: [tokenId],
    }) as `0x${string}`

    if (nftOwner.toLowerCase() !== account.toLowerCase()) {
      throw new Error("You don't own this NFT")
    }

    if (energyValue <= 0n) {
      throw new Error("Energy value must be greater than zero")
    }

    const hash = await walletClient.writeContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI,
      functionName: 'setNFTEnergyValue',
      args: [tokenId, energyValue],
      chain: sepolia,
      account: account as `0x${string}`,
    })

    return {
      success: true,
      transactionHash: hash,
    }

  } catch (error) {
    console.error("Error setting NFT energy value:", error)
    
    let errorMessage = "Failed to set NFT energy value"
    if (error instanceof Error) {
      if (error.message.includes("Not the owner")) {
        errorMessage = "You don't own this NFT"
      } else if (error.message.includes("Energy value must be greater than zero")) {
        errorMessage = "Energy value must be greater than zero"
      } else {
        errorMessage = error.message
      }
    }
    
    return { success: false, error: errorMessage }
  }
}

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

//MINT IREC NFT
export async function mintIREC(
  projectAddress: `0x${string}`,
  metadataURI: string
): Promise<{ success: boolean; hash?: `0x${string}`; tokenId?: bigint; error?: string }> {
  try {
    // Get wallet client
    const { walletClient, address } = await getWalletClient()
         
    if (!walletClient) {
      throw new Error("Wallet not connected")
    } 

    // Execute the transaction and return hash immediately
    const hash = await walletClient.writeContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'mintIREC',
      args: [projectAddress, metadataURI],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    // Return immediately with hash - don't wait for receipt
    return { success: true, hash }
   } catch (error) {
    console.error("Error minting IREC:", error)
         
    let errorMessage = "Failed to mint IREC"
    if (error instanceof Error) {
      if (error.message.includes("ADMIN_ROLE")) {
        errorMessage = "Access denied: Only admins can mint IREC tokens"
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
//Get IREC Details
export async function getIRECDetails(
  tokenId: bigint
): Promise<{ success: boolean; metadata?: string; tokenOwner?: `0x${string}`; error?: string }> {
  try {
    // Get public client for read operations
    const publicClient = getPublicClient()
         
    if (!publicClient) {
      throw new Error("Public client not available")
    }

    // Call the contract's getIRECDetails function
    const result = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'getIRECDetails',
      args: [tokenId],
    }) as [string, `0x${string}`]

    // Extract metadata and tokenOwner from the result tuple
    const [metadata, tokenOwner] = result

    return { 
      success: true, 
      metadata, 
      tokenOwner 
    }
   } catch (error) {
    console.error("Error getting IREC details:", error)
         
    let errorMessage = "Failed to get IREC details"
    if (error instanceof Error) {
      if (error.message.includes("IREC does not exist")) {
        errorMessage = "IREC token does not exist"
      } else if (error.message.includes("Invalid token ID")) {
        errorMessage = "Invalid token ID provided"
      } else {
        errorMessage = error.message
      }
    }
         
    return { success: false, error: errorMessage }
  }
}


// Hook to get user's listed NFTs
export async function getUserListings(
  userAddress: string,
  startId?: bigint,
  count: bigint = 10n
): Promise<{ success: boolean; listings?: { listingId: bigint; tokenId: bigint; price: bigint; seller: string; }[]; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const result = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'getActiveListings',
      args: [startId || 1n, count],
    }) as [bigint[], bigint[], bigint[], string[]]

    const [listingIds, tokenIds, prices, sellers] = result
    
    // Filter listings by user address
    const userListings = listingIds
      .map((id, index) => ({
        listingId: id,
        tokenId: tokenIds[index],
        price: prices[index],
        seller: sellers[index],
      }))
      .filter(listing => listing.seller.toLowerCase() === userAddress.toLowerCase())

    return { success: true, listings: userListings }
  } catch (error) {
    console.error("Error fetching user listings:", error)
    return { success: false, error: "Failed to fetch user listings" }
  }
}

// Hook to cancel a listing
export async function cancelListing(
  listingId: bigint
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> {
  try {
    const { walletClient, address } = await getWalletClient()
    
    if (!walletClient) {
      throw new Error("Wallet not connected")
    }

    const hash = await walletClient.writeContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'cancelListing',
      args: [listingId],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    return { success: true, hash }
  } catch (error) {
    console.error("Error cancelling listing:", error)
    
    let errorMessage = "Failed to cancel listing"
    if (error instanceof Error) {
      if (error.message.includes("Listing not active")) {
        errorMessage = "This listing is not active"
      } else if (error.message.includes("Not authorized")) {
        errorMessage = "You are not authorized to cancel this listing"
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else {
        errorMessage = error.message
      }
    }
    
    return { success: false, error: errorMessage }
  }
}

// ListingDetails interface for detailed listing information
export interface ListingDetails {
  listingId: bigint;
  tokenId: bigint;
  seller: string;
  price: bigint;
  active: boolean;
  totalEnergy: bigint;
  energyPerToken: bigint;
  tokenName: string;
  tokenSymbol: string;
  canBeFractionalized: boolean;
}

// Hook to get detailed listing information
export async function getListingDetails(
  listingId: bigint
): Promise<{ success: boolean; listing?: ListingDetails; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    // Get basic listing details
    const basicDetails = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'getListingDetails',
      args: [listingId],
    }) as [string, bigint, boolean, bigint]

    const [seller, price, active, tokenId] = basicDetails

    // Get fractionalization details
    const fractionalDetails = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'getListingFractionalizationDetails',
      args: [listingId],
    }) as [bigint, bigint, string, string]

    const [totalEnergy, energyPerToken, tokenName, tokenSymbol] = fractionalDetails

    // Check if can be fractionalized
    const canBeFractionalized = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'canBeFractionalized',
      args: [listingId],
    }) as boolean

    const listing: ListingDetails = {
      listingId,
      tokenId,
      seller,
      price,
      active,
      totalEnergy,
      energyPerToken,
      tokenName,
      tokenSymbol,
      canBeFractionalized,
    }

    return { success: true, listing }
  } catch (error) {
    console.error("Error fetching listing details:", error)
    return { success: false, error: "Failed to fetch listing details" }
  }
}

// Hook to get all active listings with pagination
export async function getActiveListings(
  startId: bigint = 1n,
  count: bigint = 20n
): Promise<{ success: boolean; listings?: ListingDetails[]; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const result = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'getActiveListings',
      args: [startId, count],
    }) as [bigint[], bigint[], bigint[], string[]]

    const [listingIds, tokenIds, prices, sellers] = result
    
    // Fetch detailed listing info for each listingId to match ListingDetails interface
    const listings: ListingDetails[] = await Promise.all(
      listingIds.map(async (id, index) => {
        const detailsResult = await getListingDetails(id);
        if (detailsResult.success && detailsResult.listing) {
          return detailsResult.listing;
        }
        // fallback: fill with minimal info and defaults if details fetch fails
        return {
          listingId: id,
          tokenId: tokenIds[index],
          price: prices[index],
          seller: sellers[index],
          active: false,
          totalEnergy: 0n,
          energyPerToken: 0n,
          tokenName: "",
          tokenSymbol: "",
          canBeFractionalized: false,
        };
      })
    );

    return { success: true, listings }
  } catch (error) {
    console.error("Error fetching active listings:", error)
    return { success: false, error: "Failed to fetch active listings" }
  }
}

// Hook to check platform fee
export async function getPlatformFee(): Promise<{ success: boolean; feePercentage?: bigint; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const feePercentage = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'platformFeePercentage',
    }) as bigint

    return { success: true, feePercentage }
  } catch (error) {
    console.error("Error fetching platform fee:", error)
    return { success: false, error: "Failed to fetch platform fee" }
  }
}

// Hook to calculate platform fee for a given amount
export async function calculatePlatformFee(
  amount: bigint
): Promise<{ success: boolean; fee?: bigint; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const fee = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'calculatePlatformFee',
      args: [amount],
    }) as bigint

    return { success: true, fee }
  } catch (error) {
    console.error("Error calculating platform fee:", error)
    return { success: false, error: "Failed to calculate platform fee" }
  }
}

// Define an interface for fractional token info
export interface FractionalTokenInfo {
  address: string;
  totalSupply: bigint;
  energyPerToken: bigint;
  totalEnergyValue: bigint;
}

// Hook to get fractional token information for an NFT
export async function getFractionalTokenInfo(
  tokenId: bigint
): Promise<{ success: boolean; tokenInfo?: FractionalTokenInfo | null; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    // This would require the fractionalization contract address and ABI
    // You'll need to add these to your constants
    const fractionalTokenAddress = await publicClient.readContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI, 
      functionName: 'nftToFractionalToken',
      args: [tokenId],
    }) as string

    if (fractionalTokenAddress === "0x0000000000000000000000000000000000000000") {
      return { success: true, tokenInfo: null }
    }

    // Get token details if it exists
    const [totalSupply, energyPerToken, totalEnergyValue] = await Promise.all([
      publicClient.readContract({
        address: fractionalTokenAddress as `0x${string}`,
        abi: fractionalTokenABI, // Use the correct ABI for all calls
        functionName: 'totalSupply',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: fractionalTokenAddress as `0x${string}`,
        abi: fractionalTokenABI,
        functionName: 'energyPerToken',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: fractionalTokenAddress as `0x${string}`,
        abi: fractionalTokenABI,
        functionName: 'totalEnergyValue',
      }) as Promise<bigint>
    ])

    const tokenInfo: FractionalTokenInfo = {
      address: fractionalTokenAddress,
      totalSupply,
      energyPerToken,
      totalEnergyValue,
    }

    return { success: true, tokenInfo }
  } catch (error) {
    console.error("Error fetching fractional token info:", error)
    return { success: false, error: "Failed to fetch fractional token info" }
  }
}

// Hook to check user's fractional token balance
export async function getUserFractionalBalance(
 FractionalTokenAddress: string,
  userAddress: string
): Promise<{ success: boolean; balance?: bigint; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const balance = await publicClient.readContract({
      address: FractionalTokenAddress as `0x${string}`,
      abi: fractionalTokenABI, 
      functionName: 'balanceOf',
      args: [userAddress],
    }) as bigint

    return { success: true, balance }
  } catch (error) {
    console.error("Error fetching fractional balance:", error)
    return { success: false, error: "Failed to fetch fractional balance" }
  }
}

// Hook to approve marketplace for NFT transfer
export async function approveMarketplace(
  IrecNFTAddress: string,
  tokenId: bigint
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> {
  try {
    const { walletClient, address } = await getWalletClient()
    
    if (!walletClient) {
      throw new Error("Wallet not connected")
    }

    const hash = await walletClient.writeContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI, 
      functionName: 'approve',
      args: [MarketplaceAddress, tokenId],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    return { success: true, hash }
  } catch (error) {
    console.error("Error approving marketplace:", error)
    
    let errorMessage = "Failed to approve marketplace"
    if (error instanceof Error) {
      if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else {
        errorMessage = error.message
      }
    }
    
    return { success: false, error: errorMessage }
  }
}

// Hook to approve marketplace for all NFTs
export async function setApprovalForAll(
  IrecNFTAddress: string,
  approved: boolean = true
): Promise<{ success: boolean; hash?: `0x${string}`; receipt?: unknown; error?: string }> {
  try {
    const { walletClient, address } = await getWalletClient()
    const publicClient = getPublicClient()
    
    if (!walletClient) {
      throw new Error("Wallet not connected")
    }

    if (!publicClient) {
      throw new Error("Public client not available")
    }

    const hash = await walletClient.writeContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI, // Add ERC721 ABI
      functionName: 'setApprovalForAll',
      args: [MarketplaceAddress, approved],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    // Wait for transaction to be confirmed
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1, // Wait for at least 1 confirmation
    })

    // Check if transaction was successful
    if (receipt.status === 'reverted') {
      throw new Error('Transaction was reverted')
    }

    return { success: true, hash, receipt }
  } catch (error) {
    console.error("Error setting approval for all:", error)
    
    let errorMessage = "Failed to set approval for all"
    if (error instanceof Error) {
      if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else {
        errorMessage = error.message
      }
    }
    
    return { success: false, error: errorMessage }
  }
}
// Hook to check if marketplace is approved for an NFT
export async function isMarketplaceApproved(
  IrecNFTAddress: string,
  tokenId: bigint,
  ownerAddress: string
): Promise<{ success: boolean; isApproved?: boolean; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    // Check specific token approval
    const approvedAddress = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'getApproved',
      args: [tokenId],
    }) as string

    // Check approval for all
    const isApprovedForAll = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI, // Add ERC721 ABI
      functionName: 'isApprovedForAll',
      args: [ownerAddress, MarketplaceAddress],
    }) as boolean

    const isApproved = approvedAddress.toLowerCase() === MarketplaceAddress.toLowerCase() || isApprovedForAll

    return { success: true, isApproved }
  } catch (error) {
    console.error("Error checking marketplace approval:", error)
    return { success: false, error: "Failed to check marketplace approval" }
  }
}

// Hook to get marketplace statistics
export async function getMarketplaceStats(): Promise<{ 
  success: boolean; 
  stats?: { 
    totalListings: number;
    activeListings: number;
    platformFee: bigint;
  }; 
  error?: string 
}> {
  try {
    const publicClient = getPublicClient()
    
    // Get platform fee
    const platformFee = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'platformFeePercentage',
    }) as bigint

    // Get active listings to count them
    const activeListingsResult = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'getActiveListings',
      args: [1n, 1000n], // Get up to 1000 listings
    }) as [bigint[], bigint[], bigint[], string[]]

    const stats = {
      totalListings: activeListingsResult[0].length, // This is a simplified count
      activeListings: activeListingsResult[0].length,
      platformFee,
    }

    return { success: true, stats }
  } catch (error) {
    console.error("Error fetching marketplace stats:", error)
    return { success: false, error: "Failed to fetch marketplace stats" }
  }
}

// Hook to search listings by energy criteria
export async function searchListingsByEnergy(
  minEnergy?: bigint,
  maxEnergy?: bigint,
  startId: bigint = 1n,
  count: bigint = 20n
): Promise<{ success: boolean; listings?: ListingDetails[]; error?: string }> {
  try {
    // First get all active listings
    const { success, listings: allListings, error } = await getActiveListings(startId, count)
    
    if (!success || !allListings) {
      return { success: false, error }
    }

    // Filter by energy if criteria provided
    const filteredListings = []
    
    for (const listing of allListings) {
      const detailsResult = await getListingDetails(listing.listingId)
      
      if (detailsResult.success && detailsResult.listing) {
        const { totalEnergy } = detailsResult.listing
        
        const meetsMinCriteria = !minEnergy || totalEnergy >= minEnergy
        const meetsMaxCriteria = !maxEnergy || totalEnergy <= maxEnergy
        
        if (meetsMinCriteria && meetsMaxCriteria) {
          filteredListings.push(detailsResult.listing)
        }
      }
    }

    return { success: true, listings: filteredListings }
  } catch (error) {
    console.error("Error searching listings by energy:", error)
    return { success: false, error: "Failed to search listings by energy" }
  }
}

export async function isApprovedProject(
  userAddress: string
): Promise<{ success: boolean; isApproved?: boolean; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const isApproved = await publicClient.readContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'isApprovedProject',
      args: [userAddress],
    }) as boolean

    return { success: true, isApproved }
  } catch {
    return { success: false, error: "Failed to check project approval" }
  }
}