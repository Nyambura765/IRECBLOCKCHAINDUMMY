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
    fractionalTokenABI,
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

/**
 * List a whole NFT for sale
 */
export async function listWholeNFT(
  tokenId: bigint,
  price: bigint
): Promise<{ success: boolean; hash?: `0x${string}`; listingId?: bigint; error?: string }> {
  try {
    const { walletClient, address } = await getWalletClient()
         
    if (!walletClient) {
      throw new Error("Wallet not connected")
    } 

    const hash = await walletClient.writeContract({
      address: MarketplaceAddress as `0x${string}`, 
      abi: marketplaceABI, 
      functionName: 'listWholeNFT',
      args: [tokenId, price],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    // Note: In a real implementation, you'd wait for the transaction receipt
    // to get the actual listingId from the event logs
    return { success: true, hash }
   } catch (error) {
    console.error("Error listing whole NFT:", error)
         
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

/**
 * Purchase a whole NFT
 */
export async function purchaseWholeNFT(
  listingId: bigint
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> {
  try {
    const { walletClient, address } = await getWalletClient()
         
    if (!walletClient) {
      throw new Error("Wallet not connected")
    }

    // First get the listing price
    const publicClient = getPublicClient()
    const listing = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'nftListings',
      args: [listingId],
    }) as [string, bigint, boolean, bigint] // [seller, price, active, tokenId]

    if (!listing[2]) { // active check
      throw new Error("Listing not active")
    }

    const hash = await walletClient.writeContract({
      address: MarketplaceAddress as `0x${string}`, 
      abi: marketplaceABI, 
      functionName: 'purchaseWholeNFT',
      args: [listingId],
      value: listing[1], // price
      chain: sepolia,
      account: address as `0x${string}`,
    })

    return { success: true, hash }
   } catch (error) {
    console.error("Error purchasing whole NFT:", error)
         
    let errorMessage = "Failed to purchase NFT"
    if (error instanceof Error) {
      if (error.message.includes("Listing not active")) {
        errorMessage = "This listing is no longer active"
      } else if (error.message.includes("Cannot buy your own listing")) {
        errorMessage = "You cannot purchase your own listing"
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
/**
 * List fractional tokens for sale (with automatic approval)
 */
export async function listFractionalTokens(
  fractionalTokenAddress: string,
  pricePerToken: bigint,
  tokensToList: bigint,
  minimumPurchase: bigint
): Promise<{ success: boolean; hash?: `0x${string}`; listingId?: bigint; error?: string }> {
  try {
    const { walletClient, address } = await getWalletClient();
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    //  Check current allowance for the specific token
    const allowanceResult = await getFractionalTokenAllowance(
      fractionalTokenAddress, 
      address as string
    );
    
    if (!allowanceResult.success) {
      throw new Error("Failed to check token allowance");
    }

    const currentAllowance = allowanceResult.allowance || 0n;

    // Step 2: If not enough allowance, approve the marketplace
    if (currentAllowance < tokensToList) {
      console.log(`Current allowance: ${currentAllowance}, Required: ${tokensToList}`);
      console.log("Requesting approval for marketplace...");
      
      const approvalResult = await approveFractionalTokens(
        fractionalTokenAddress, 
        tokensToList
      );
      
      if (!approvalResult.success) {
        throw new Error(approvalResult.error || "Failed to approve tokens");
      }

      // Wait for approval transaction to be mined
      if (approvalResult.hash) {
        await waitForTransaction({ hash: approvalResult.hash });
        console.log("Approval transaction confirmed");
      }
    } else {
      console.log("Sufficient allowance already exists");
    }

    //  list the tokens on the marketplace
    console.log("Listing tokens on marketplace...");
    const hash = await walletClient.writeContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'listFractionalTokens',
      args: [fractionalTokenAddress, pricePerToken, tokensToList, minimumPurchase],
      chain: sepolia,
      account: address as `0x${string}`,
    });

    return { success: true, hash };
  } catch (error) {
    console.error("Error listing fractional tokens:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
}

/**
 * Purchase fractional tokens
 */
export async function purchaseFractionalTokens(
  listingId: bigint,
  tokenAmount: bigint
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> {
  try {
    const { walletClient, address } = await getWalletClient()
         
    if (!walletClient) {
      throw new Error("Wallet not connected")
    }

    // Get listing details to calculate payment
    const publicClient = getPublicClient()
    const listing = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'fractionalListings',
      args: [listingId],
    }) as [string, bigint, bigint, boolean, string, bigint] // [seller, pricePerToken, tokensAvailable, active, fractionalTokenAddress, minimumPurchase]

    if (!listing[3]) { // active check
      throw new Error("Listing not active")
    }

    const totalPrice = listing[1] * tokenAmount // pricePerToken * tokenAmount

    const hash = await walletClient.writeContract({
      address: MarketplaceAddress as `0x${string}`, 
      abi: marketplaceABI, 
      functionName: 'purchaseFractionalTokens',
      args: [listingId, tokenAmount],
      value: totalPrice,
      chain: sepolia,
      account: address as `0x${string}`,
    })

    return { success: true, hash }
   } catch (error) {
    console.error("Error purchasing fractional tokens:", error)
         
    let errorMessage = "Failed to purchase fractional tokens"
    if (error instanceof Error) {
      if (error.message.includes("Listing not active")) {
        errorMessage = "This listing is no longer active"
      } else if (error.message.includes("Cannot buy your own listing")) {
        errorMessage = "You cannot purchase your own listing"
      } else if (error.message.includes("Below minimum purchase amount")) {
        errorMessage = "Purchase amount is below minimum required"
      } else if (error.message.includes("Insufficient tokens available")) {
        errorMessage = "Not enough tokens available for purchase"
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

/**
 * Update fractional token listing
 */
export async function updateFractionalListing(
  listingId: bigint,
  newPricePerToken: bigint = 0n,
  additionalTokens: bigint = 0n
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> {
  try {
    const { walletClient, address } = await getWalletClient()
         
    if (!walletClient) {
      throw new Error("Wallet not connected")
    }

    const hash = await walletClient.writeContract({
      address: MarketplaceAddress as `0x${string}`, 
      abi: marketplaceABI, 
      functionName: 'updateFractionalListing',
      args: [listingId, newPricePerToken, additionalTokens],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    return { success: true, hash }
   } catch (error) {
    console.error("Error updating fractional listing:", error)
         
    let errorMessage = "Failed to update listing"
    if (error instanceof Error) {
      if (error.message.includes("Listing not active")) {
        errorMessage = "This listing is not active"
      } else if (error.message.includes("Not the seller")) {
        errorMessage = "You are not the seller of this listing"
      } else if (error.message.includes("Insufficient token balance")) {
        errorMessage = "Insufficient token balance for additional tokens"
      } else if (error.message.includes("Insufficient token allowance")) {
        errorMessage = "Please approve additional tokens for transfer"
      } else if (error.message.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else {
        errorMessage = error.message
      }
    }
         
    return { success: false, error: errorMessage }
  }
}

// ============ LISTING MANAGEMENT FUNCTIONS ============

/**
 * Cancel an NFT listing
 */
export async function cancelNFTListing(
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
      functionName: 'cancelNFTListing',
      args: [listingId],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    return { success: true, hash }
  } catch (error) {
    console.error("Error cancelling NFT listing:", error)
    
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

/**
 * Cancel a fractional token listing
 */
export async function cancelFractionalListing(
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
      functionName: 'cancelFractionalListing',
      args: [listingId],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    return { success: true, hash }
  } catch (error) {
    console.error("Error cancelling fractional listing:", error)
    
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

// ============ VIEW FUNCTIONS ============

/**
 * NFT Listing Details Interface
 */
export interface NFTListingDetails {
  listingId: bigint;
  seller: string;
  price: bigint;
  active: boolean;
  tokenId: bigint;
}

/**
 * Fractional Listing Details Interface
 */
export interface FractionalListingDetails {
  listingId: bigint;
  seller: string;
  pricePerToken: bigint;
  tokensAvailable: bigint;
  active: boolean;
  fractionalTokenAddress: string;
  minimumPurchase: bigint;
}

/**
 * Get NFT listing details
 */
export async function getNFTListingDetails(
  listingId: bigint
): Promise<{ success: boolean; listing?: NFTListingDetails; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const result = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'getNFTListingDetails',
      args: [listingId],
    }) as [string, bigint, boolean, bigint] // [seller, price, active, tokenId]

    const listing: NFTListingDetails = {
      listingId,
      seller: result[0],
      price: result[1],
      active: result[2],
      tokenId: result[3],
    }

    return { success: true, listing }
  } catch (error) {
    console.error("Error fetching NFT listing details:", error)
    return { success: false, error: "Failed to fetch NFT listing details" }
  }
}

/**
 * Get fractional listing details
 */
export async function getFractionalListingDetails(
  listingId: bigint
): Promise<{ success: boolean; listing?: FractionalListingDetails; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const result = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'getFractionalListingDetails',
      args: [listingId],
    }) as [string, bigint, bigint, boolean, string, bigint] // [seller, pricePerToken, tokensAvailable, active, fractionalTokenAddress, minimumPurchase]

    const listing: FractionalListingDetails = {
      listingId,
      seller: result[0],
      pricePerToken: result[1],
      tokensAvailable: result[2],
      active: result[3],
      fractionalTokenAddress: result[4],
      minimumPurchase: result[5],
    }

    return { success: true, listing }
  } catch (error) {
    console.error("Error fetching fractional listing details:", error)
    return { success: false, error: "Failed to fetch fractional listing details" }
  }
}

/**
 * Get active NFT listings
 */
export async function getActiveNFTListings(
  startId: bigint = 1n,
  count: bigint = 20n
): Promise<{ success: boolean; listings?: NFTListingDetails[]; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const result = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'getActiveNFTListings',
      args: [startId, count],
    }) as [bigint[], bigint[], bigint[], string[]] // [listingIds, tokenIds, prices, sellers]

    const [listingIds, tokenIds, prices, sellers] = result
    
    const listings: NFTListingDetails[] = listingIds.map((id, index) => ({
      listingId: id,
      seller: sellers[index],
      price: prices[index],
      active: true, // These are from getActiveNFTListings so they're active
      tokenId: tokenIds[index],
    }))

    return { success: true, listings }
  } catch (error) {
    console.error("Error fetching active NFT listings:", error)
    return { success: false, error: "Failed to fetch active NFT listings" }
  }
}

/**
 * Get active fractional listings
 */
export async function getActiveFractionalListings(
  startId: bigint = 1n,
  count: bigint = 20n
): Promise<{ success: boolean; listings?: FractionalListingDetails[]; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const result = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'getActiveFractionalListings',
      args: [startId, count],
    }) as [bigint[], string[], bigint[], bigint[], string[]] // [listingIds, tokenAddresses, pricesPerToken, tokensAvailable, sellers]

    const [listingIds, tokenAddresses, pricesPerToken, tokensAvailable, sellers] = result
    
    // Note: We need to get minimumPurchase for each listing separately
    const listings: FractionalListingDetails[] = await Promise.all(
      listingIds.map(async (id, index) => {
        // Get full details to get minimumPurchase
        const detailsResult = await getFractionalListingDetails(id);
        return {
          listingId: id,
          seller: sellers[index],
          pricePerToken: pricesPerToken[index],
          tokensAvailable: tokensAvailable[index],
          active: true,
          fractionalTokenAddress: tokenAddresses[index],
          minimumPurchase: detailsResult.listing?.minimumPurchase || 1n,
        };
      })
    )

    return { success: true, listings }
  } catch (error) {
    console.error("Error fetching active fractional listings:", error)
    return { success: false, error: "Failed to fetch active fractional listings" }
  }
}

/**
 * Get user's NFT listings
 */
export async function getUserNFTListings(
  userAddress: string
): Promise<{ success: boolean; listingIds?: bigint[]; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const listingIds = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'getSellerNFTListings',
      args: [userAddress],
    }) as bigint[]

    return { success: true, listingIds }
  } catch (error) {
    console.error("Error fetching user NFT listings:", error)
    return { success: false, error: "Failed to fetch user NFT listings" }
  }
}

/**
 * Get user's fractional listings
 */
export async function getUserFractionalListings(
  userAddress: string
): Promise<{ success: boolean; listingIds?: bigint[]; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const listingIds = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'getSellerFractionalListings',
      args: [userAddress],
    }) as bigint[]

    return { success: true, listingIds }
  } catch (error) {
    console.error("Error fetching user fractional listings:", error)
    return { success: false, error: "Failed to fetch user fractional listings" }
  }
}

// ============ UTILITY FUNCTIONS ============

/**
 * Calculate platform fee
 */
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

/**
 * Get platform fee percentage
 */
export async function getPlatformFeePercentage(): Promise<{ success: boolean; feePercentage?: bigint; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const feePercentage = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'platformFeePercentage',
    }) as bigint

    return { success: true, feePercentage }
  } catch (error) {
    console.error("Error fetching platform fee percentage:", error)
    return { success: false, error: "Failed to fetch platform fee percentage" }
  }
}

/**
 * Calculate total cost for fractional token purchase (including fees)
 */
export async function calculateFractionalPurchaseCost(
  listingId: bigint,
  tokenAmount: bigint
): Promise<{ success: boolean; totalCost?: bigint; platformFee?: bigint; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    // Get listing details
    const listing = await publicClient.readContract({
      address: MarketplaceAddress as `0x${string}`,
      abi: marketplaceABI,
      functionName: 'fractionalListings',
      args: [listingId],
    }) as [string, bigint, bigint, boolean, string, bigint]

    if (!listing[3]) { // active check
      throw new Error("Listing not active")
    }

    const subtotal = listing[1] * tokenAmount // pricePerToken * tokenAmount
    
    // Calculate platform fee
    const feeResult = await calculatePlatformFee(subtotal)
    if (!feeResult.success) {
      throw new Error(feeResult.error)
    }

    const platformFee = feeResult.fee!
    const totalCost = subtotal // The contract handles fee distribution internally

    return { success: true, totalCost, platformFee }
  } catch (error) {
    console.error("Error calculating fractional purchase cost:", error)
    return { success: false, error: "Failed to calculate purchase cost" }
  }
}

// ============ TOKEN APPROVAL FUNCTIONS ============

/**
 * Approve marketplace for fractional token transfer
 */
export async function approveFractionalTokens(
  FractionalTokenAddress: string,
  amount: bigint
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> {
  try {
    const { walletClient, address } = await getWalletClient()
    
    if (!walletClient) {
      throw new Error("Wallet not connected")
    }

    const hash = await walletClient.writeContract({
      address: FractionalTokenAddress as `0x${string}`,
      abi: fractionalTokenABI, 
      functionName: 'approve',
      args: [MarketplaceAddress, amount],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    return { success: true, hash }
  } catch (error) {
    console.error("Error approving fractional tokens:", error)
    
    let errorMessage = "Failed to approve tokens"
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

/**
 * Check fractional token allowance
 */
export async function getFractionalTokenAllowance(
  tokenAddress: string,  
  ownerAddress: string
): Promise<{ success: boolean; allowance?: bigint; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const allowance = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: fractionalTokenABI,
      functionName: 'allowance',
      args: [ownerAddress, MarketplaceAddress],
    }) as bigint

    return { success: true, allowance }
  } catch (error) {
    console.error("Error fetching token allowance:", error)
    return { success: false, error: "Failed to fetch token allowance" }
  }
}
// ============ EXISTING UTILITY FUNCTIONS (Updated) ============

/**
 * Approve marketplace for NFT transfer (individual token)
 */
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

/**
 * Approve marketplace for all NFTs
 */
export async function setApprovalForAll(
  IrecNFTAddress: string,
  approved: boolean = true
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> {
  try {
    const { walletClient, address } = await getWalletClient()
    
    if (!walletClient) {
      throw new Error("Wallet not connected")
    }

    const hash = await walletClient.writeContract({
      address: IrecNFTAddress as `0x${string}`,
      abi: IrecNFTABI,
      functionName: 'setApprovalForAll',
      args: [MarketplaceAddress, approved],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    return { success: true, hash }
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

/**
 * Check if marketplace is approved for an NFT
 */
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
      abi: IrecNFTABI,
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

/**
 * Get fractional token address for a specific NFT ID
 */
export async function getFractionalTokenAddress(
  nftId: string | number
): Promise<{ success: boolean; tokenAddress?: string; error?: string }> {
  try {
    const publicClient = getPublicClient()
    
    const tokenAddress = await publicClient.readContract({
      address: FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI,
      functionName: 'getFractionalTokenAddress',
      args: [BigInt(nftId)],
    }) as string

    // Check if NFT is fractionalized (returns zero address if not)
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return { 
        success: false, 
        error: "NFT is not fractionalized" 
      }
    }

    return { 
      success: true, 
      tokenAddress 
    }
  } catch (error) {
    console.error("Error fetching fractional token address:", error)
    
    let errorMessage = "Failed to fetch fractional token address"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return { 
      success: false, 
      error: errorMessage 
    }
  }
}

/**
 * Wait for a transaction to be mined and return the receipt.
 */
export async function waitForTransaction({ hash }: { hash: `0x${string}`; }) {
  const publicClient = getPublicClient();
  return await publicClient.waitForTransactionReceipt({ hash });
}
//Redeem NFT
export async function redeem(
  tokenId: bigint
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> {
  try {
    const { walletClient, address } = await getWalletClient()
    
    if (!walletClient) {
      throw new Error("Wallet not connected")
    }

    const hash = await walletClient.writeContract({
      address:FractionalizationAddress as `0x${string}`,
      abi: fractionalizationABI,
      functionName: 'redeem',
      args: [tokenId],
      chain: sepolia,
      account: address as `0x${string}`,
    })

    return { success: true, hash }
  } catch (error) {
    console.error("Error redeeming NFT:", error)
    
    let errorMessage = "Failed to redeem NFT"
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
