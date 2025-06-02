import React, { useState } from 'react';

import IRECDashboard from '../components/User/SellerDashboard';
import IRECAdminDashboard from '../components/IRECDashboard/IrecAdminDashboard';
import Hero from '../components/Hero';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Marketplace from '../components/Marketplace';

// Type definitions for ConnectButton render props
interface ConnectButtonRenderProps {
  account?: {
    address: string;
    displayName: string;
    displayBalance?: string;
  };
  chain?: {
    id: number;
    name?: string;
    iconUrl?: string;
    iconBackground?: string;
    hasIcon: boolean;
    unsupported?: boolean;
  };
  openAccountModal: () => void;
  openChainModal: () => void;
  openConnectModal: () => void;
  mounted: boolean;
}

const Main: React.FC = () => {
  const [currentView, setCurrentView] = useState<'hero' | 'dashboard' | 'marketplace' | 'admin'>('hero');
  useAccount(); // Check wallet connection status

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  const handleBackToHome = () => {
    setCurrentView('hero');
  };

  const handleExploreMarketplace = () => {
    setCurrentView('marketplace');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleBackToHome}
                className="text-xl font-bold text-green-600 hover:text-green-600 transition-colors"
              >
                NEST
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('hero')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'hero'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentView('marketplace')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'marketplace'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Marketplace
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'admin'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Admin
              </button>
              {/* Connect Wallet Button */}
              <div className="ml-4">
                <ConnectButton.Custom>
                  {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }: ConnectButtonRenderProps) => {
                    const ready = mounted;
                    const connected = ready && account && chain;

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          style: {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                Connect Wallet
                              </button>
                            );
                          }

                          if (chain?.unsupported) {
                            return (
                              <button
                                onClick={openChainModal}
                                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                              >
                                Wrong network
                              </button>
                            );
                          }

                          return (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={openChainModal}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                              >
                                {chain?.hasIcon && (
                                  <div
                                    style={{
                                      background: chain.iconBackground,
                                      width: 12,
                                      height: 12,
                                      borderRadius: 999,
                                      overflow: 'hidden',
                                      marginRight: 4,
                                    }}
                                  >
                                    {chain.iconUrl && (
                                      <img
                                        alt={chain.name}
                                        src={chain.iconUrl}
                                        style={{ width: 12, height: 12 }}
                                      />
                                    )}
                                  </div>
                                )}
                                {chain?.name}
                              </button>

                              <button
                                onClick={openAccountModal}
                                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                {account?.displayName}
                                {account?.displayBalance
                                  ? ` (${account.displayBalance})`
                                  : ''}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === 'hero' && (
          <Hero 
            onGetStarted={handleGetStarted}
            onExploreMarketplace={handleExploreMarketplace}
          />
        )}
        
        {currentView === 'dashboard' && <IRECDashboard />}
        
        {currentView === 'marketplace' && <Marketplace />}

        {currentView === 'admin' && <IRECAdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 NEST. Empowering sustainable energy through tokenization.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Main;