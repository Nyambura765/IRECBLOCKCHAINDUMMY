import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Eye, Coins, CheckCircle, AlertTriangle, Loader2, Zap } from 'lucide-react';
import { 
  listWholeNFT,
  purchaseWholeNFT,
  listFractionalTokens,
  purchaseFractionalTokens,
  cancelNFTListing,
  cancelFractionalListing,
  getActiveNFTListings,
  getActiveFractionalListings,
  getUserNFTListings,
  getUserFractionalListings,
  getNFTListingDetails,
  getFractionalListingDetails,
  calculateFractionalPurchaseCost,
  setApprovalForAll,
  getWalletClient
} from '../BlockchainServices/irecPlatformHooks';

const IrecNFTAddress = '0x757Bc598387c35a293334123294d290eBDD92712';


interface NFTListing {
  listingId: bigint;
  seller: string;
  price: bigint;
  active: boolean;
  tokenId: bigint;
}

interface FractionalListing {
  listingId: bigint;
  seller: string;
  pricePerToken: bigint;
  tokensAvailable: bigint;
  active: boolean;
  fractionalTokenAddress: string;
  minimumPurchase: bigint;
  tokenSymbol?: string; 
  tokenName?: string; 
}

interface PurchaseRequest {
  id: number;
  listingId: bigint;
  buyer: string;
  purchaseAmount: bigint;
  isFractional: boolean;
  isCompleted: boolean;
  paidAmount: string;
  transactionHash?: string;
}

interface LoadingState {
  loadingListings: boolean;
  purchasing: boolean;
  listing: boolean;
  connectingWallet: boolean;
  calculating: boolean;
  cancelling: boolean;
}

interface TransactionStatus {
  type: 'success' | 'error' | 'info';
  message: string;
  hash?: string;
}

const Marketplace: React.FC = () => {
  const [nftListings, setNftListings] = useState<NFTListing[]>([]);
  const [fractionalListings, setFractionalListings] = useState<FractionalListing[]>([]);
  const [userNftListings, setUserNftListings] = useState<NFTListing[]>([]);
  const [userFractionalListings, setUserFractionalListings] = useState<FractionalListing[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [selectedTab, setSelectedTab] = useState<'marketplace' | 'create' | 'manage'>('marketplace');
  const [selectedListing, setSelectedListing] = useState<NFTListing | FractionalListing | null>(null);
  const [fractionalAmount, setFractionalAmount] = useState<bigint>(1n);
  const [userAddress, setUserAddress] = useState<string>('');
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [platformFee] = useState<number>(2.5);
  const [showCancelConfirm, setShowCancelConfirm] = useState<bigint | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    loadingListings: false,
    purchasing: false,
    listing: false,
    connectingWallet: false,
    calculating: false,
    cancelling: false
  });
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [requiredPayment, setRequiredPayment] = useState<bigint | null>(null);
  const [newListing, setNewListing] = useState({
    tokenId: '',
    price: '',
    isFractional: false,
    fractionalTokenAddress: '',
    tokensToList: '',
    pricePerToken: '',
    minimumPurchase: '1'
  });

  // Connect wallet and load data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(prev => ({ ...prev, connectingWallet: true }));
        const { address } = await getWalletClient();
        
        if (address) {
          setUserAddress(address);
          setIsWalletConnected(true);
          loadMarketplaceData(address);
        }
      } catch (error) {
        console.error('Error initializing wallet:', error);
      } finally {
        setLoading(prev => ({ ...prev, connectingWallet: false }));
      }
    };

    init();

    // Handle account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
          setIsWalletConnected(true);
          loadMarketplaceData(accounts[0]);
        } else {
          setUserAddress('');
          setIsWalletConnected(false);
          setNftListings([]);
          setFractionalListings([]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  const loadMarketplaceData = async (address: string) => {
    try {
      setLoading(prev => ({ ...prev, loadingListings: true }));
      
      // Load active listings
      const nftResult = await getActiveNFTListings();
      if (nftResult.success && nftResult.listings) {
        setNftListings(nftResult.listings);
      }

      const fractionalResult = await getActiveFractionalListings();
      if (fractionalResult.success && fractionalResult.listings) {
        setFractionalListings(fractionalResult.listings);
      }

      // Load user's listings
      const userNftIds = await getUserNFTListings(address);
      if (userNftIds.success && userNftIds.listingIds) {
        const userNfts = await Promise.all(
          userNftIds.listingIds.map(id => getNFTListingDetails(id))
        );
        setUserNftListings(userNfts.filter(r => r.success && r.listing).map(r => r.listing!));
      }

      const userFractionalIds = await getUserFractionalListings(address);
      if (userFractionalIds.success && userFractionalIds.listingIds) {
        const userFractionals = await Promise.all(
          userFractionalIds.listingIds.map(id => getFractionalListingDetails(id))
        );
        setUserFractionalListings(userFractionals.filter(r => r.success && r.listing).map(r => r.listing!));
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(prev => ({ ...prev, loadingListings: false }));
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(prev => ({ ...prev, connectingWallet: true }));
      
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const { address } = await getWalletClient();
        
        if (address) {
          setUserAddress(address);
          setIsWalletConnected(true);
          loadMarketplaceData(address);
          showStatus({
            type: 'success',
            message: 'Wallet connected successfully!'
          });
        }
      } else {
        throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      showStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect wallet'
      });
    } finally {
      setLoading(prev => ({ ...prev, connectingWallet: false }));
    }
  };

  const showStatus = (status: TransactionStatus) => {
    setTransactionStatus(status);
    setTimeout(() => setTransactionStatus(null), 5000);
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatEther = (wei: bigint): string => {
    return (Number(wei) / 1e18).toFixed(4);
  };

  const parseEther = (ether: string): bigint => {
    return BigInt(Math.floor(parseFloat(ether) * 1e18));
  };

 const handleCreateListing = async () => {
  // Validate based on listing type
  if (newListing.isFractional) {
    // Validate fractional listing fields
    if (!newListing.fractionalTokenAddress || !newListing.pricePerToken || 
        !newListing.tokensToList || !newListing.minimumPurchase) {
      showStatus({
        type: 'error',
        message: 'Please fill all required fields for fractional listing'
      });
      return;
    }
  } else {
    // Validate whole NFT listing fields
    if (!newListing.tokenId || !newListing.price) {
      showStatus({
        type: 'error',
        message: 'Please fill all required fields for NFT listing'
      });
      return;
    }
  }
  
  setLoading(prev => ({ ...prev, listing: true }));
  
  try {
    let result;
    
    if (newListing.isFractional) {
      //  No approval needed here - listFractionalTokens handles its own ERC20 approval
      result = await listFractionalTokens(
        newListing.fractionalTokenAddress,
        parseEther(newListing.pricePerToken),
        BigInt(newListing.tokensToList),
        BigInt(newListing.minimumPurchase)
      );
    } else {
      //  Only approve marketplace for whole NFT listings
      const approvalResult = await setApprovalForAll(IrecNFTAddress, true);
      if (!approvalResult.success) {
        showStatus({
          type: 'error',
          message: approvalResult.error || 'Failed to approve marketplace'
        });
        return;
      }
      
      result = await listWholeNFT(
        BigInt(newListing.tokenId),
        parseEther(newListing.price)
      );
    }
    
    if (result.success) {
      showStatus({
        type: 'success',
        message: `Successfully listed ${newListing.isFractional ? 'fractional tokens' : 'NFT'}!`,
        hash: result.hash
      });
      
      // Reset form
      setNewListing({
        tokenId: '',
        price: '',
        isFractional: false,
        fractionalTokenAddress: '',
        tokensToList: '',
        pricePerToken: '',
        minimumPurchase: '1'
      });
      
      // Refresh data
      if (userAddress) {
        loadMarketplaceData(userAddress);
      }
      
      setSelectedTab('marketplace');
    } else {
      showStatus({
        type: 'error',
        message: result.error || 'Failed to create listing'
      });
    }
  } catch (error) {
    console.error('Listing error:', error);
    showStatus({
      type: 'error',
      message: 'An unexpected error occurred'
    });
  } finally {
    setLoading(prev => ({ ...prev, listing: false }));
  }
};

  const handlePurchase = async () => {
    if (!selectedListing || !requiredPayment) {
      showStatus({
        type: 'error',
        message: 'Invalid purchase parameters'
      });
      return;
    }
    
    setLoading(prev => ({ ...prev, purchasing: true }));
    
    try {
      let result;
      if ('fractionalTokenAddress' in selectedListing) {
        // Fractional purchase
        result = await purchaseFractionalTokens(
          selectedListing.listingId,
          fractionalAmount
        );
      } else {
        // Whole NFT purchase
        result = await purchaseWholeNFT(selectedListing.listingId);
      }

      if (result.success) {
        const newRequest: PurchaseRequest = {
          id: Date.now(),
          listingId: selectedListing.listingId,
          buyer: userAddress,
          purchaseAmount: 'fractionalTokenAddress' in selectedListing ? fractionalAmount : 1n,
          isFractional: 'fractionalTokenAddress' in selectedListing,
          isCompleted: true,
          paidAmount: formatEther(requiredPayment),
          transactionHash: result.hash
        };

        setPurchaseRequests([...purchaseRequests, newRequest]);
        showStatus({
          type: 'success',
          message: `Successfully purchased ${'fractionalTokenAddress' in selectedListing ? 'fractional tokens' : 'NFT'}!`,
          hash: result.hash
        });

        // Refresh listings
        loadMarketplaceData(userAddress);
        setSelectedListing(null);
      } else {
        showStatus({
          type: 'error',
          message: result.error || 'Failed to complete purchase'
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      showStatus({
        type: 'error',
        message: 'An unexpected error occurred during purchase'
      });
    } finally {
      setLoading(prev => ({ ...prev, purchasing: false }));
    }
  };

  const handleCancelListing = async (listingId: bigint, isFractional: boolean) => {
    setLoading(prev => ({ ...prev, cancelling: true }));
    
    try {
      const result = isFractional 
        ? await cancelFractionalListing(listingId)
        : await cancelNFTListing(listingId);

      if (result.success) {
        showStatus({
          type: 'success',
          message: 'Listing cancelled successfully!',
          hash: result.hash
        });
        
        // Refresh listings
        loadMarketplaceData(userAddress);
      } else {
        showStatus({
          type: 'error',
          message: result.error || 'Failed to cancel listing'
        });
      }
    } catch (error) {
      console.error('Cancel error:', error);
      showStatus({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    } finally {
      setLoading(prev => ({ ...prev, cancelling: false }));
      setShowCancelConfirm(null);
    }
  };

  // Calculate required payment when selected listing changes
  useEffect(() => {
    if (!selectedListing) {
      setRequiredPayment(null);
      return;
    }

    const calculatePayment = async () => {
      setLoading(prev => ({ ...prev, calculating: true }));
      
      try {
        if ('fractionalTokenAddress' in selectedListing) {
          const result = await calculateFractionalPurchaseCost(
            selectedListing.listingId,
            fractionalAmount
          );
          
          if (result.success && result.totalCost) {
            setRequiredPayment(result.totalCost);
          } else {
            throw new Error(result.error);
          }
        } else {
          // For whole NFTs, the price is the listing price
          setRequiredPayment(selectedListing.price);
        }
      } catch (error) {
        console.error('Payment calculation error:', error);
        showStatus({
          type: 'error',
          message: 'Failed to calculate payment'
        });
      } finally {
        setLoading(prev => ({ ...prev, calculating: false }));
      }
    };

    calculatePayment();
  }, [selectedListing, fractionalAmount]);

  const renderTransactionStatus = () => {
    if (!transactionStatus) return null;
    
    const bgColor = transactionStatus.type === 'success' ? 'bg-green-100 border-green-200' :
                   transactionStatus.type === 'error' ? 'bg-red-100 border-red-200' :
                   'bg-blue-100 border-blue-200';
    const textColor = transactionStatus.type === 'success' ? 'text-green-800' :
                     transactionStatus.type === 'error' ? 'text-red-800' :
                     'text-blue-800';
                     
    return (
      <div className={`fixed top-4 right-4 p-4 rounded-lg border ${bgColor} ${textColor} max-w-md z-50 shadow-lg`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{transactionStatus.message}</p>
            {transactionStatus.hash && (
              <p className="text-xs mt-1 opacity-75">
                Tx: {formatAddress(transactionStatus.hash)}
              </p>
            )}
          </div>
          <button
            onClick={() => setTransactionStatus(null)}
            className="ml-2 opacity-50 hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderMarketplace = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          Active Listings
        </h2>
        <div className="text-sm text-gray-600">
          Platform Fee: {platformFee}%
        </div>
      </div>

      {/* Whole NFT Listings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Whole NFTs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nftListings.filter(listing => listing.active).map(listing => (
            <div key={listing.listingId.toString()} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">NFT #{listing.tokenId.toString()}</h3>
                    <p className="text-sm text-gray-600">by {formatAddress(listing.seller)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{formatEther(listing.price)} ETH</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {listing.seller === userAddress && (
                    <button
                      onClick={() => setShowCancelConfirm(listing.listingId)}
                      className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 border border-red-200"
                    >
                      <X className="w-4 h-4" />
                      Cancel Listing
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {nftListings.filter(listing => listing.active).length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No active NFT listings available</p>
          </div>
        )}
      </div>

      {/* Fractional Listings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fractional Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fractionalListings.filter(listing => listing.active).map(listing => (
            <div key={listing.listingId.toString()} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{listing.tokenSymbol || 'Tokens'}</h3>
                    <p className="text-sm text-gray-600">by {formatAddress(listing.seller)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">{formatEther(listing.pricePerToken)} ETH/token</div>
                    <div className="text-sm text-gray-600">{listing.tokensAvailable.toString()} available</div>
                  </div>
                </div>
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Fractional Tokens</span>
                  </div>
                  <div className="text-xs text-green-700">
                    <div>Min Purchase: {listing.minimumPurchase.toString()} tokens</div>
                    <div>Token: {listing.tokenSymbol || listing.fractionalTokenAddress.slice(0, 6)}...</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {listing.seller === userAddress && (
                    <button
                      onClick={() => setShowCancelConfirm(listing.listingId)}
                      className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 border border-red-200"
                    >
                      <X className="w-4 h-4" />
                      Cancel Listing
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {fractionalListings.filter(listing => listing.active).length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No active fractional listings available</p>
          </div>
        )}
      </div>
    </div>
  );

 const renderCreateListing = () => (
  <div className="max-w-2xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <Plus className="w-6 h-6" />
      Create New Listing
    </h2>
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Listing Type</h3>
          <p className="text-sm text-gray-600">Choose what you want to list</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setNewListing({...newListing, isFractional: false})}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              !newListing.isFractional
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Whole NFT
          </button>
          <button
            onClick={() => setNewListing({...newListing, isFractional: true})}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              newListing.isFractional
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fractional Tokens
          </button>
        </div>
      </div>

      {!newListing.isFractional ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NFT Token ID *
              </label>
              <input
                type="number"
                value={newListing.tokenId}
                onChange={(e) => setNewListing({...newListing, tokenId: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter token ID"
                disabled={loading.listing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (ETH) *
              </label>
              <input
                type="number"
                step="0.01"
                value={newListing.price}
                onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
                disabled={loading.listing}
                required
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fractional Token Address *
              </label>
              <input
                type="text"
                value={newListing.fractionalTokenAddress}
                onChange={(e) => setNewListing({...newListing, fractionalTokenAddress: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0x..."
                disabled={loading.listing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Token (ETH) *
              </label>
              <input
                type="number"
                step="0.0001"
                value={newListing.pricePerToken}
                onChange={(e) => setNewListing({...newListing, pricePerToken: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.0000"
                disabled={loading.listing}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tokens to List *
              </label>
              <input
                type="number"
                value={newListing.tokensToList}
                onChange={(e) => setNewListing({...newListing, tokensToList: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1000"
                disabled={loading.listing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Purchase *
              </label>
              <input
                type="number"
                min="1"
                value={newListing.minimumPurchase}
                onChange={(e) => setNewListing({...newListing, minimumPurchase: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1"
                disabled={loading.listing}
                required
              />
            </div>
          </div>
        </>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleCreateListing}
          disabled={loading.listing}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading.listing && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading.listing ? 'Creating Listing...' : 'Create Listing'}
        </button>
        <button
          onClick={() => setSelectedTab('marketplace')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading.listing}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

  const renderManageListings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Listings & Purchases</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Listings */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">My Listings</h3>
          <div className="space-y-4">
            {/* Whole NFT Listings */}
            {userNftListings.map(listing => (
              <div key={listing.listingId.toString()} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">NFT #{listing.tokenId.toString()}</h4>
                    <p className="text-sm text-gray-600">{formatEther(listing.price)} ETH</p>
                    <p className="text-xs text-gray-500">Listing ID: {listing.listingId.toString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {listing.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        <X className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                {listing.active && (
                  <button
                    onClick={() => setShowCancelConfirm(listing.listingId)}
                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium transition-colors border border-red-200"
                  >
                    Cancel Listing
                  </button>
                )}
              </div>
            ))}

            {/* Fractional Listings */}
            {userFractionalListings.map(listing => (
              <div key={listing.listingId.toString()} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{listing.tokenSymbol || 'Fractional Tokens'}</h4>
                    <p className="text-sm text-gray-600">{formatEther(listing.pricePerToken)} ETH/token</p>
                    <p className="text-xs text-gray-500">
                      Listing ID: {listing.listingId.toString()} • {listing.tokensAvailable.toString()} available
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {listing.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        <X className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                {listing.active && (
                  <button
                    onClick={() => setShowCancelConfirm(listing.listingId)}
                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium transition-colors border border-red-200"
                  >
                    Cancel Listing
                  </button>
                )}
              </div>
            ))}

            {userNftListings.length === 0 && userFractionalListings.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">You don't have any active listings</p>
              </div>
            )}
          </div>
        </div>

        {/* Purchase History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase History</h3>
          <div className="space-y-4">
            {purchaseRequests.map(request => (
              <div key={request.id} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {request.isFractional ? 'Fractional' : 'Whole NFT'} Purchase
                    </h4>
                    <p className="text-sm text-gray-600">
                      Listing #{request.listingId.toString()} • {request.purchaseAmount.toString()} {request.isFractional ? 'tokens' : 'NFT'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800">{request.paidAmount} ETH</div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  </div>
                </div>
                {request.transactionHash && (
                  <p className="text-xs text-gray-500 mt-2">
                    Tx: {formatAddress(request.transactionHash)}
                  </p>
                )}
              </div>
            ))}
            {purchaseRequests.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No purchase history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPurchaseModal = () => {
    if (!selectedListing) return null;
    
    const isFractional = 'fractionalTokenAddress' in selectedListing;
    const price = isFractional 
      ? (selectedListing as FractionalListing).pricePerToken * fractionalAmount
      : (selectedListing as NFTListing).price;
    
    const platformFeeAmount = price * BigInt(platformFee * 100) / 10000n; // Calculate 2.5% fee
    const totalPrice = price + platformFeeAmount;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {isFractional ? 'Purchase Tokens' : `Purchase NFT #${selectedListing.tokenId}`}
            </h3>
            <button
              onClick={() => setSelectedListing(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Seller</div>
              <div className="font-medium">{formatAddress(selectedListing.seller)}</div>
              {isFractional ? (
                <>
                  <div className="text-sm text-gray-600 mt-2">Price Per Token</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatEther((selectedListing as FractionalListing).pricePerToken)} ETH
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mt-2">Listed Price</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatEther((selectedListing as NFTListing).price)} ETH
                  </div>
                </>
              )}
            </div>

            {isFractional && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tokens
                </label>
                <input
                  type="number"
                  min="1"
                  max={(selectedListing as FractionalListing).tokensAvailable.toString()}
                  value={fractionalAmount.toString()}
                  onChange={(e) => setFractionalAmount(BigInt(e.target.value || '1'))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-600 mt-1">
                  Available: {(selectedListing as FractionalListing).tokensAvailable.toString()} tokens
                </div>
              </div>
            )}

            <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                <span className="text-gray-600">Item Price</span>
                <span>{formatEther(price)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee ({platformFee}%)</span>
                <span>{formatEther(platformFeeAmount)} ETH</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-green-600">{formatEther(totalPrice)} ETH</span>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading.purchasing || loading.calculating}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.purchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  Confirm Purchase
                </>
              )}
            </button>

            {loading.calculating && (
              <div className="text-center text-sm text-gray-500">
                Calculating total cost...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCancelConfirmation = () => {
    if (!showCancelConfirm) return null;

    const listing = [...userNftListings, ...userFractionalListings].find(
      l => l.listingId === showCancelConfirm
    );
    if (!listing) return null;

    const isFractional = 'fractionalTokenAddress' in listing;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Cancel Listing
            </h3>
            <button
              onClick={() => setShowCancelConfirm(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to cancel this listing?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Important</h4>
                  <p className="text-sm text-yellow-700">
                    Canceling this listing will remove it from the marketplace.
                    {isFractional && ' Any remaining tokens will remain in your wallet.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleCancelListing(listing.listingId, isFractional)}
                disabled={loading.cancelling}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading.cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading.cancelling ? 'Canceling...' : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(null)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading.cancelling}
              >
                No, Keep Listed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 -mt-8">
      {/* Header */}
      <header className="bg-white shadow-sm pt-0">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            iREC Marketplace
          </h1>
          {!isWalletConnected ? (
            <button
              onClick={connectWallet}
              disabled={loading.connectingWallet}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading.connectingWallet && <Loader2 className="w-4 h-4 animate-spin" />}
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm font-medium">
                {formatAddress(userAddress)}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('marketplace')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'marketplace'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setSelectedTab('create')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'create'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Listing
            </button>
            <button
              onClick={() => setSelectedTab('manage')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'manage'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!isWalletConnected}
            >
              My Listings
            </button>
          </nav>
        </div>

        {/* Content based on selected tab */}
        {loading.loadingListings ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <>
            {selectedTab === 'marketplace' && renderMarketplace()}
            {selectedTab === 'create' && renderCreateListing()}
            {selectedTab === 'manage' && renderManageListings()}
          </>
        )}
      </main>

      {/* Modals */}
      {renderPurchaseModal()}
      {renderCancelConfirmation()}
      {renderTransactionStatus()}
    </div>
  );
};

export default Marketplace;