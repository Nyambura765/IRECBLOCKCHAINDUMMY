import  { useState } from 'react';
import { User, ShoppingCart, Wallet, TrendingUp, Battery, Zap, DollarSign, Package, Eye, ShoppingBag, Plus, Edit3, Trash2, Search, Filter, Award } from 'lucide-react';

const IRECDashboard = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [userSubTab, setUserSubTab] = useState('portfolio');
  const [sellerSubTab, setSellerSubTab] = useState('inventory');

  // Mock data
  const mockUserData = {
    balance: "2.5 ETH",
    totalInvested: "$12,450",
    totalTokens: 1250,
    totalEnergy: "3.8 MW",
    portfolio: [
      {
        id: 1,
        name: "Solar Farm #001",
        tokens: 500,
        energyValue: "1.5 MW",
        currentValue: "$4,200",
        change: "+12.5%",
        type: "Solar"
      },
      {
        id: 2,
        name: "Wind Project Beta",
        tokens: 750,
        energyValue: "2.3 MW",
        currentValue: "$8,250",
        change: "-2.1%",
        type: "Wind"
      }
    ],
    transactions: [
      { id: 1, type: "Buy", project: "Solar Farm #001", amount: "0.5 ETH", tokens: 100, date: "2024-01-15" },
      { id: 2, type: "Sell", project: "Wind Project Beta", amount: "0.3 ETH", tokens: 50, date: "2024-01-10" }
    ]
  };

  const mockSellerData = {
    totalRevenue: "$45,670",
    activeListings: 8,
    totalSales: 234,
    averagePrice: "$8.50",
    inventory: [
      {
        id: 1,
        name: "Solar Farm Alpha",
        totalSupply: 10000,
        available: 6500,
        sold: 3500,
        pricePerToken: "$12.00",
        energyPerToken: "0.003 MW",
        status: "Active"
      },
      {
        id: 2,
        name: "Hydro Station Gamma",
        totalSupply: 5000,
        available: 2100,
        sold: 2900,
        pricePerToken: "$15.50",
        energyPerToken: "0.005 MW",
        status: "Active"
      }
    ],
    listings: [
      {
        id: 1,
        project: "Solar Farm Alpha",
        tokensListed: 1000,
        pricePerToken: "$12.00",
        totalValue: "$12,000",
        views: 45,
        status: "Active"
      },
      {
        id: 2,
        project: "Wind Complex Delta",
        tokensListed: 500,
        pricePerToken: "$18.00",
        totalValue: "$9,000",
        views: 23,
        status: "Pending"
      }
    ]
  };

  const UserDashboard = () => (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Wallet Balance</p>
              <p className="text-2xl font-bold">{mockUserData.balance}</p>
            </div>
            <Wallet className="h-8 w-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Invested</p>
              <p className="text-2xl font-bold">{mockUserData.totalInvested}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Total Tokens</p>
              <p className="text-2xl font-bold">{mockUserData.totalTokens}</p>
            </div>
            <Package className="h-8 w-8 text-teal-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-lime-500 to-lime-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lime-100 text-sm">Energy Owned</p>
              <p className="text-2xl font-bold">{mockUserData.totalEnergy}</p>
            </div>
            <Battery className="h-8 w-8 text-lime-200" />
          </div>
        </div>
      </div>

      {/* User Sub Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {['portfolio', 'transactions', 'marketplace'].map((tab) => (
          <button
            key={tab}
            onClick={() => setUserSubTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userSubTab === tab
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* User Content */}
      {userSubTab === 'portfolio' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">My Portfolio</h3>
          <div className="grid gap-4">
            {mockUserData.portfolio.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      item.type === 'Solar' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      {item.type === 'Solar' ? (
                        <Zap className="h-6 w-6 text-yellow-600" />
                      ) : (
                        <Battery className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.tokens} tokens • {item.energyValue}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.currentValue}</p>
                    <p className={`text-sm ${
                      item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>{item.change}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    Sell Tokens
                  </button>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 flex items-center space-x-1">
                    <Award className="h-4 w-4" />
                    <span>Redeem NFT</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {userSubTab === 'transactions' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Transaction History</h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockUserData.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tx.type === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.project}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.tokens}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {userSubTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Browse Marketplace</h3>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Browse and purchase fractional IREC tokens from available projects</p>
            <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Browse All Listings
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const SellerDashboard = () => (
    <div className="space-y-6">
      {/* Seller Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">{mockSellerData.totalRevenue}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Active Listings</p>
              <p className="text-2xl font-bold">{mockSellerData.activeListings}</p>
            </div>
            <Package className="h-8 w-8 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Total Sales</p>
              <p className="text-2xl font-bold">{mockSellerData.totalSales}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-teal-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-lime-500 to-lime-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lime-100 text-sm">Avg. Price</p>
              <p className="text-2xl font-bold">{mockSellerData.averagePrice}</p>
            </div>
            <Wallet className="h-8 w-8 text-lime-200" />
          </div>
        </div>
      </div>

      {/* Seller Sub Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {['inventory', 'listings', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSellerSubTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              sellerSubTab === tab
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Seller Content */}
      {sellerSubTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">IREC Inventory</h3>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Fractionalize NFT</span>
            </button>
          </div>
          <div className="grid gap-4">
            {mockSellerData.inventory.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.energyPerToken} per token • Total Supply: {item.totalSupply.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold">{item.pricePerToken}</p>
                    <p className="text-sm text-gray-600">per token</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Available: {item.available.toLocaleString()}</span>
                    <span>Sold: {item.sold.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(item.sold / item.totalSupply) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                    Create Listing
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    Set Energy Value
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sellerSubTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Active Listings</h3>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Listing</span>
            </button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockSellerData.listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {listing.project}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {listing.tokensListed.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {listing.pricePerToken}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {listing.totalValue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {listing.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          listing.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-green-600 hover:text-green-900">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {sellerSubTab === 'analytics' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Sales Analytics</h3>
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Detailed analytics and sales reports</p>
            <p className="text-sm mt-2">View performance metrics, revenue trends, and buyer insights</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Main Navigation */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">IREC Dashboard</h1>
        <div className="flex space-x-1 bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('user')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'user'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="h-4 w-4" />
            <span>User</span>
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'seller'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Seller</span>
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'user' ? <UserDashboard /> : <SellerDashboard />}
    </div>
  );
};

export default IRECDashboard;