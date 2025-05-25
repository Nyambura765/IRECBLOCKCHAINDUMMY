import React, { useState } from 'react';
import { ShoppingCart, Plus, X, Eye, Zap, Coins, CheckCircle, AlertTriangle } from 'lucide-react';

interface Listing {
  id: number;
  tokenId: number;
  seller: string;
  price: string;
  active: boolean;
  totalEnergy: number;
  energyPerToken: number;
  tokenName: string;
  tokenSymbol: string;
  fractionalTokenAddress?: string;
  remainingTokens?: number;
}

interface PurchaseRequest {
  id: number;
  listingId: number;
  buyer: string;
  purchaseAmount: number;
  isFractional: boolean;
  isCompleted: boolean;
  paidAmount: string;
}

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([
    {
      id: 1,
      tokenId: 101,
      seller: '0x1234...5678',
      price: '2.5',
      active: true,
      totalEnergy: 1000,
      energyPerToken: 10,
      tokenName: 'Solar Energy Credits',
      tokenSymbol: 'SEC',
      remainingTokens: 100
    },
    {
      id: 2,
      tokenId: 102,
      seller: '0xabcd...efgh',
      price: '5.0',
      active: true,
      totalEnergy: 2000,
      energyPerToken: 20,
      tokenName: 'Wind Energy Credits',
      tokenSymbol: 'WEC',
      remainingTokens: 100
    },
    {
      id: 3,
      tokenId: 103,
      seller: '0x9876...5432',
      price: '1.8',
      active: true,
      totalEnergy: 0,
      energyPerToken: 0,
      tokenName: '',
      tokenSymbol: ''
    }
  ]);

  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [selectedTab, setSelectedTab] = useState<'marketplace' | 'create' | 'manage'>('marketplace');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [purchaseMode, setPurchaseMode] = useState<'full' | 'fractional'>('full');
  const [fractionalAmount, setFractionalAmount] = useState<number>(1);
  const [userAddress] = useState('0x1234...abcd'); // Mock user address
  const [platformFee] = useState(2.5); // 2.5%
  const [showCancelConfirm, setShowCancelConfirm] = useState<number | null>(null);

  // New listing form state
  const [newListing, setNewListing] = useState({
    tokenId: '',
    price: '',
    totalEnergy: '',
    energyPerToken: '',
    tokenName: '',
    tokenSymbol: ''
  });

  const calculatePlatformFee = (amount: number): number => {
    return (amount * platformFee) / 100;
  };

  const calculateFractionalPrice = (listing: Listing, amount: number): number => {
    if (!listing.totalEnergy || !listing.energyPerToken) return 0;
    const totalTokens = listing.totalEnergy / listing.energyPerToken;
    const pricePerToken = parseFloat(listing.price) / totalTokens;
    return pricePerToken * amount;
  };

  const canBeFractionalized = (listing: Listing): boolean => {
    return listing.totalEnergy > 0 && 
           listing.energyPerToken > 0 && 
           listing.tokenName.length > 0 &&
           listing.tokenSymbol.length > 0;
  };

  const handleCreateListing = () => {
    if (!newListing.tokenId || !newListing.price) {
      alert('Token ID and Price are required');
      return;
    }

    const listing: Listing = {
      id: Date.now(),
      tokenId: parseInt(newListing.tokenId),
      seller: userAddress,
      price: newListing.price,
      active: true,
      totalEnergy: parseInt(newListing.totalEnergy) || 0,
      energyPerToken: parseInt(newListing.energyPerToken) || 0,
      tokenName: newListing.tokenName,
      tokenSymbol: newListing.tokenSymbol,
      remainingTokens: newListing.totalEnergy && newListing.energyPerToken ? 
        parseInt(newListing.totalEnergy) / parseInt(newListing.energyPerToken) : 0
    };

    setListings([...listings, listing]);
    setNewListing({
      tokenId: '',
      price: '',
      totalEnergy: '',
      energyPerToken: '',
      tokenName: '',
      tokenSymbol: ''
    });
    setSelectedTab('marketplace');
  };

  const handlePurchase = () => {
    if (!selectedListing) return;

    let purchaseAmount = 0;
    let totalPrice = 0;

    if (purchaseMode === 'full') {
      totalPrice = parseFloat(selectedListing.price);
      purchaseAmount = selectedListing.remainingTokens || 0;
    } else {
      totalPrice = calculateFractionalPrice(selectedListing, fractionalAmount);
      purchaseAmount = fractionalAmount;
    }

    const fee = calculatePlatformFee(totalPrice);
    const finalPrice = totalPrice + fee;

    const newRequest: PurchaseRequest = {
      id: Date.now(),
      listingId: selectedListing.id,
      buyer: userAddress,
      purchaseAmount: purchaseAmount,
      isFractional: purchaseMode === 'fractional',
      isCompleted: true,
      paidAmount: finalPrice.toFixed(4)
    };

    // Update listing
    const updatedListings = listings.map(listing => {
      if (listing.id === selectedListing.id) {
        if (purchaseMode === 'full') {
          return { ...listing, active: false };
        } else {
          const newRemainingTokens = (listing.remainingTokens || 0) - fractionalAmount;
          return { 
            ...listing, 
            remainingTokens: newRemainingTokens,
            active: newRemainingTokens > 0
          };
        }
      }
      return listing;
    });

    setListings(updatedListings);
    setPurchaseRequests([...purchaseRequests, newRequest]);
    setSelectedListing(null);
    setPurchaseMode('full');
    setFractionalAmount(1);
  };

  const handleCancelListing = (listingId: number) => {
    const updatedListings = listings.map(listing => 
      listing.id === listingId ? { ...listing, active: false } : listing
    );
    setListings(updatedListings);
    setShowCancelConfirm(null);
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.filter(listing => listing.active).map(listing => (
          <div key={listing.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">NFT #{listing.tokenId}</h3>
                  <p className="text-sm text-gray-600">by {formatAddress(listing.seller)}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{listing.price} ETH</div>
                </div>
              </div>

              {canBeFractionalized(listing) && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Fractionalizable</span>
                  </div>
                  <div className="space-y-1 text-xs text-green-700">
                    <div>Total Energy: {listing.totalEnergy.toLocaleString()} kW</div>
                    <div>Energy/Token: {listing.energyPerToken} kW</div>
                    <div>Tokens Available: {listing.remainingTokens}</div>
                    <div>Token: {listing.tokenSymbol}</div>
                  </div>
                </div>
              )}

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
                    onClick={() => setShowCancelConfirm(listing.id)}
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

      {listings.filter(listing => listing.active).length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No active listings available</p>
        </div>
      )}
    </div>
  );

  const renderCreateListing = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Plus className="w-6 h-6" />
        Create New Listing
      </h2>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
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
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Fractionalization Settings (Optional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Energy (kW)
              </label>
              <input
                type="number"
                value={newListing.totalEnergy}
                onChange={(e) => setNewListing({...newListing, totalEnergy: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Energy per Token (kW)
              </label>
              <input
                type="number"
                value={newListing.energyPerToken}
                onChange={(e) => setNewListing({...newListing, energyPerToken: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Name
              </label>
              <input
                type="text"
                value={newListing.tokenName}
                onChange={(e) => setNewListing({...newListing, tokenName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Solar Energy Credits"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Symbol
              </label>
              <input
                type="text"
                value={newListing.tokenSymbol}
                onChange={(e) => setNewListing({...newListing, tokenSymbol: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="SEC"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleCreateListing}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Create Listing
          </button>
          <button
            onClick={() => setSelectedTab('marketplace')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
            {listings.filter(listing => listing.seller === userAddress).map(listing => (
              <div key={listing.id} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">NFT #{listing.tokenId}</h4>
                    <p className="text-sm text-gray-600">{listing.price} ETH</p>
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
                
                {canBeFractionalized(listing) && (
                  <div className="text-xs text-gray-600 mb-2">
                    Remaining tokens: {listing.remainingTokens}
                  </div>
                )}

                {listing.active && (
                  <button
                    onClick={() => setShowCancelConfirm(listing.id)}
                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium transition-colors border border-red-200"
                  >
                    Cancel Listing
                  </button>
                )}
              </div>
            ))}
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
                      {request.isFractional ? 'Fractional' : 'Full'} Purchase
                    </h4>
                    <p className="text-sm text-gray-600">
                      Listing #{request.listingId} • {request.purchaseAmount} {request.isFractional ? 'tokens' : 'NFT'}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPurchaseModal = () => {
    if (!selectedListing) return null;

    const fullPrice = parseFloat(selectedListing.price);
    const fractionalPrice = calculateFractionalPrice(selectedListing, fractionalAmount);
    const selectedPrice = purchaseMode === 'full' ? fullPrice : fractionalPrice;
    const platformFeeAmount = calculatePlatformFee(selectedPrice);
    const totalPrice = selectedPrice + platformFeeAmount;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Purchase NFT #{selectedListing.tokenId}</h3>
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
              <div className="text-sm text-gray-600 mt-2">Listed Price</div>
              <div className="text-xl font-bold text-green-600">{selectedListing.price} ETH</div>
            </div>

            {canBeFractionalized(selectedListing) && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPurchaseMode('full')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      purchaseMode === 'full'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Buy Full NFT
                  </button>
                  <button
                    onClick={() => setPurchaseMode('fractional')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      purchaseMode === 'fractional'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Buy Tokens
                  </button>
                </div>

                {purchaseMode === 'fractional' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Tokens ({selectedListing.tokenSymbol})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedListing.remainingTokens}
                      value={fractionalAmount}
                      onChange={(e) => setFractionalAmount(parseInt(e.target.value) || 1)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      Available: {selectedListing.remainingTokens} tokens
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Item Price:</span>
                <span>{selectedPrice.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Platform Fee ({platformFee}%):</span>
                <span>{platformFeeAmount.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{totalPrice.toFixed(4)} ETH</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handlePurchase}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Coins className="w-4 h-4" />
                Confirm Purchase
              </button>
              <button
                onClick={() => setSelectedListing(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Cancel Confirmation Modal
  const renderCancelConfirmModal = () => {
    if (!showCancelConfirm) return null;
    
    const listing = listings.find(l => l.id === showCancelConfirm);
    if (!listing) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Cancel Listing</h3>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-3">
              Are you sure you want to cancel this listing? This action cannot be undone.
            </p>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-800">NFT #{listing.tokenId}</div>
              <div className="text-sm text-gray-600">Price: {listing.price} ETH</div>
              {canBeFractionalized(listing) && (
                <div className="text-sm text-gray-600">
                  Remaining tokens: {listing.remainingTokens}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleCancelListing(showCancelConfirm)}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Yes, Cancel Listing
            </button>
            <button
              onClick={() => setShowCancelConfirm(null)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Listing
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">IREC NFT Marketplace</h1>
          <p className="text-gray-600">Trade renewable energy certificates as NFTs with fractional ownership</p>
        </div>

        {/* Navigation */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setSelectedTab('marketplace')}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
              selectedTab === 'marketplace'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setSelectedTab('create')}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
              selectedTab === 'create'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Create Listing
          </button>
          <button
            onClick={() => setSelectedTab('manage')}
            className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
              selectedTab === 'manage'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Activity
          </button>
        </div>

        {/* Content */}
        {selectedTab === 'marketplace' && renderMarketplace()}
        {selectedTab === 'create' && renderCreateListing()}
        {selectedTab === 'manage' && renderManageListings()}

        {/* Modals */}
        {renderPurchaseModal()}
        {renderCancelConfirmModal()}
      </div>
    </div>
  );
};

export default Marketplace;