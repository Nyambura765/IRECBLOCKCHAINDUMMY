import React, { useState } from 'react';
import { Leaf, Twitter, Linkedin, Github, Mail, Phone, MapPin, Sun, Moon } from 'lucide-react';
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
  const [darkMode, setDarkMode] = useState(false);

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  const handleBackToHome = () => {
    setCurrentView('hero');
  };

  const handleExploreMarketplace = () => {
    setCurrentView('marketplace');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Fixed Navigation Header */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={handleBackToHome}
                  className="flex items-center space-x-2 text-xl font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                >
                  <Leaf className="w-6 h-6" />
                  <span>NEST</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('hero')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'hero'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'marketplace'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Marketplace
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'admin'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Admin
                </button>
                
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
                                  className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                                >
                                  Connect Wallet
                                </button>
                              );
                            }

                            if (chain?.unsupported) {
                              return (
                                <button
                                  onClick={openChainModal}
                                  className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                                >
                                  Wrong network
                                </button>
                              );
                            }

                            return (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={openChainModal}
                                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
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
                                  className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
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

        {/* Main Content with top padding to account for fixed navbar */}
        <main className="pt-16">
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

      {/* Enhanced Footer - Only show on hero/home view */}
        {currentView === 'hero' && (
          <footer className="bg-white text-gray-900 mt-12 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Main footer content */}
              <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Company Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Leaf className="w-8 h-8 text-green-600" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      NEST
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Empowering sustainable energy through innovative blockchain tokenization and IREC certification across Africa.
                  </p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-500 hover:text-green-600 transition-colors duration-300">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-green-600 transition-colors duration-300">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-green-600 transition-colors duration-300">
                      <Github className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Quick Links</h4>
                  <ul className="space-y-2">
                    <li>
                      <button 
                        onClick={() => setCurrentView('hero')}
                        className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                      >
                        Home
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setCurrentView('marketplace')}
                        className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                      >
                        Marketplace
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setCurrentView('dashboard')}
                        className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                      >
                        Dashboard
                      </button>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-300">
                        About Us
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Services */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Services</h4>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-300">
                        IREC Trading
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-300">
                        Carbon Credits
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-300">
                        Project Verification
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-300">
                        Impact Tracking
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Contact Us</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">hello@nest.energy</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">+254 700 000 000</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">Nairobi, Kenya</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom section */}
              <div className="border-t border-gray-200 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <div className="text-gray-500 text-sm">
                    &copy; 2025 NEST. All rights reserved. Empowering sustainable energy through tokenization.
                  </div>
                  <div className="flex space-x-6 text-sm">
                    <a href="#" className="text-gray-500 hover:text-green-600 transition-colors duration-300">
                      Privacy Policy
                    </a>
                    <a href="#" className="text-gray-500 hover:text-green-600 transition-colors duration-300">
                      Terms of Service
                    </a>
                    <a href="#" className="text-gray-500 hover:text-green-600 transition-colors duration-300">
                      Cookie Policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Main;