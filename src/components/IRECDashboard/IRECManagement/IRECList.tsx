import React, { useState } from 'react';
import { Search, Hash, User } from 'lucide-react';

interface IRECDetails {
  metadata: string;
  tokenOwner: `0x${string}`;
}

interface IrecListProps {
  formatAddress: (addr: string) => string;
  getIRECDetails: (tokenId: bigint) => Promise<{ success: boolean; metadata?: string; tokenOwner?: `0x${string}`; error?: string }>;
}

export const IrecList: React.FC<IrecListProps> = ({
  formatAddress,
  getIRECDetails,
}) => {
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [irecDetails, setIrecDetails] = useState<IRECDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenIdInput, setTokenIdInput] = useState('');

  const handleGetDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenIdInput.trim()) {
      setError('Please enter a token ID');
      return;
    }

    let tokenId: bigint;
    try {
      tokenId = BigInt(tokenIdInput.trim());
    } catch {
      setError('Invalid token ID format');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedTokenId(tokenIdInput.trim());
    
    try {
      const result = await getIRECDetails(tokenId);
      
      if (result.success && result.metadata && result.tokenOwner) {
        setIrecDetails({
          metadata: result.metadata,
          tokenOwner: result.tokenOwner
        });
      } else {
        setError(result.error || 'Failed to fetch IREC details');
        setIrecDetails(null);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIrecDetails(null);
      console.error('Error fetching IREC details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMetadata = (metadata: string) => {
    try {
      return JSON.parse(metadata);
    } catch {
      return { raw: metadata };
    }
  };

  const clearResults = () => {
    setSelectedTokenId(null);
    setIrecDetails(null);
    setError(null);
    setTokenIdInput('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">IREC Token Details</h2>
        <p className="text-gray-600">Enter a token ID to view detailed information about an IREC token</p>
      </div>

      {/* Token ID Input Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-2">
              Token ID
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="tokenId"
                value={tokenIdInput}
                onChange={(e) => setTokenIdInput(e.target.value)}
                placeholder="Enter token ID (e.g., 1, 2, 3...)"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGetDetails(e as React.KeyboardEvent<HTMLInputElement>);
                  }
                }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleGetDetails}
            disabled={isLoading || !tokenIdInput.trim()}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Loading...
              </>
            ) : (
              <>
                <Search className="-ml-1 mr-2 h-4 w-4" />
                Get IREC Details
              </>
            )}
          </button>
          {(selectedTokenId || error) && (
            <button
              type="button"
              onClick={clearResults}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Results Display */}
      {selectedTokenId && irecDetails && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              IREC Token #{selectedTokenId} Details
            </h3>
          </div>
          
          <div className="space-y-6">
            {/* Token Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Current Owner
              </label>
              <div className="font-mono text-sm bg-gray-100 px-3 py-2 rounded border break-all">
                {irecDetails.tokenOwner}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Formatted: {formatAddress(irecDetails.tokenOwner)}
              </div>
            </div>

            {/* Metadata Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metadata
              </label>
              <div className="bg-gray-50 rounded-md p-4 border">
                {(() => {
                  const parsedMetadata = parseMetadata(irecDetails.metadata);
                  
                  if (parsedMetadata.raw) {
                    // If parsing failed, show raw metadata
                    return (
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                        {irecDetails.metadata}
                      </pre>
                    );
                  }
                  
                  // If parsed successfully, show formatted JSON
                  return (
                    <div className="space-y-3">
                      {Object.entries(parsedMetadata).map(([key, value]) => (
                        <div key={key} className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-900">
                            {typeof value === 'object' ? (
                              <pre className="whitespace-pre-wrap font-mono text-xs bg-white p-2 rounded border">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            ) : (
                              String(value)
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};