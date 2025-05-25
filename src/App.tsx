import React from 'react'; // Add React import
import './App.css';
import './index.css';
import Main from './pages/main';
import { Toaster } from 'react-hot-toast';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  sepolia,
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { type ReactNode } from 'react'; // Fix type-only import

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// RainbowKit configuration
const config = getDefaultConfig({
  appName: 'CarbonToken',
  projectId: import.meta.env.VITE_PROJECT_ID || 'your-project-id', // Fallback for missing env var
  chains: [
    sepolia,    // Primary testnet
    mainnet,    // Ethereum mainnet
    polygon,    // Polygon for lower fees
    optimism,   // Optimism L2
    arbitrum,   // Arbitrum L2
    base,       // Base L2
  ],
  ssr: false, // Disable server-side rendering for client-side apps
});

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">Please refresh the page and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="compact"
            initialChain={sepolia}
            showRecentTransactions={true}
            theme={{
              lightMode: {
                colors: {
                  accentColor: '#16a34a',
                  accentColorForeground: 'white',
                  actionButtonBorder: '#16a34a',
                  actionButtonBorderMobile: '#16a34a',
                  actionButtonSecondaryBackground: '#e5e7eb',
                  closeButton: '#374151',
                  closeButtonBackground: '#f3f4f6',
                  connectButtonBackground: '#16a34a',
                  connectButtonBackgroundError: '#dc2626',
                  connectButtonInnerBackground: '#16a34a',
                  connectButtonText: 'white',
                  connectButtonTextError: 'white',
                  connectionIndicator: '#16a34a',
                  downloadBottomCardBackground: '#f3f4f6',
                  downloadTopCardBackground: '#16a34a',
                  error: '#dc2626',
                  generalBorder: '#d1d5db',
                  generalBorderDim: '#e5e7eb',
                  menuItemBackground: '#f3f4f6',
                  modalBackdrop: 'rgba(0,0,0,0.3)',
                  modalBackground: 'white',
                  modalBorder: '#d1d5db',
                  modalText: '#374151',
                  modalTextDim: '#6b7280',
                  modalTextSecondary: '#16a34a',
                  profileAction: '#16a34a',
                  profileActionHover: '#15803d',
                  profileForeground: '#f3f4f6',
                  selectedOptionBorder: '#16a34a',
                  standby: '#fbbf24',
                },
                fonts: {
                  body: 'inherit'
                },
                radii: {
                  actionButton: '8px',
                  connectButton: '8px',
                  menuButton: '8px',
                  modal: '12px',
                  modalMobile: '12px',
                },
                shadows: {
                  connectButton: '0 2px 6px rgba(0,0,0,0.08)',
                  dialog: '0 4px 32px rgba(0,0,0,0.16)',
                  profileDetailsAction: '0 1px 2px rgba(0,0,0,0.08)',
                  selectedOption: '0 0px 2px rgba(22,163,74,0.15)',
                  selectedWallet: '0 2px 6px rgba(0,0,0,0.08)',
                  walletLogo: '0 1px 2px rgba(0,0,0,0.08)'
                },
                blurs: {
                  modalOverlay: 'blur(4px)'
                }
              },
              darkMode: {
                colors: {
                  accentColor: '#16a34a',
                  accentColorForeground: 'white',
                  actionButtonBorder: '#16a34a',
                  actionButtonBorderMobile: '#16a34a',
                  actionButtonSecondaryBackground: '#374151',
                  closeButton: '#f3f4f6',
                  closeButtonBackground: '#374151',
                  connectButtonBackground: '#16a34a',
                  connectButtonBackgroundError: '#dc2626',
                  connectButtonInnerBackground: '#16a34a',
                  connectButtonText: 'white',
                  connectButtonTextError: 'white',
                  connectionIndicator: '#16a34a',
                  downloadBottomCardBackground: '#374151',
                  downloadTopCardBackground: '#16a34a',
                  error: '#dc2626',
                  generalBorder: '#4b5563',
                  generalBorderDim: '#374151',
                  menuItemBackground: '#374151',
                  modalBackdrop: 'rgba(0,0,0,0.7)',
                  modalBackground: '#1f2937',
                  modalBorder: '#4b5563',
                  modalText: '#f3f4f6',
                  modalTextDim: '#9ca3af',
                  modalTextSecondary: '#16a34a',
                  profileAction: '#16a34a',
                  profileActionHover: '#15803d',
                  profileForeground: '#374151',
                  selectedOptionBorder: '#16a34a',
                  standby: '#fbbf24',
                },
                fonts: {
                  body: 'inherit'
                },
                radii: {
                  actionButton: '8px',
                  connectButton: '8px',
                  menuButton: '8px',
                  modal: '12px',
                  modalMobile: '12px',
                },
                shadows: {
                  connectButton: '0 2px 6px rgba(0,0,0,0.16)',
                  dialog: '0 4px 32px rgba(0,0,0,0.32)',
                  profileDetailsAction: '0 1px 2px rgba(0,0,0,0.16)',
                  selectedOption: '0 0px 2px rgba(22,163,74,0.25)',
                  selectedWallet: '0 2px 6px rgba(0,0,0,0.16)',
                  walletLogo: '0 1px 2px rgba(0,0,0,0.16)'
                },
                blurs: {
                  modalOverlay: 'blur(4px)'
                }
              },
            }}
          >
            <div className="App">
              <Main />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#ffffff',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#16a34a',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#dc2626',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </div>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}

export default App;