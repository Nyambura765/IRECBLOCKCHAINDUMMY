import { useState } from 'react';
import { ActionButton } from '../shared/ActionButton';
import { mintIREC } from '../../../BlockchainServices/irecPlatformHooks'; 
import type { Project } from '../types';

interface MintIrecFormProps {
  projects?: Project[]; 
  onSuccess?: (hash: `0x${string}`) => void; 
  onError?: (error: string) => void; 
}

export const MintIrecForm: React.FC<MintIrecFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState({
    projectAddress: '',
    projectName: '',
    metadataURI: '',
    energyAmount: '',
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.projectAddress || !formData.metadataURI) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await mintIREC(
        formData.projectAddress as `0x${string}`,
        formData.metadataURI
      );

      if (result.success && result.hash) {
        // Reset form on success
        setFormData({
          projectAddress: '',
          projectName: '',
          metadataURI: '',
          energyAmount: '',
        });
        
        // Call success callback if provided
        onSuccess?.(result.hash);
        
        console.log('IREC minted successfully! Transaction hash:', result.hash);
      } else {
        // Handle error
        const errorMessage = result.error || 'Failed to mint IREC';
        onError?.(errorMessage);
        console.error('Failed to mint IREC:', errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Unexpected error occurred';
      onError?.(errorMessage);
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg w-full md:w-1/3">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Mint New IREC Token</h4>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input
          type="text"
          placeholder="Project Address (0x...)"
          value={formData.projectAddress}
          onChange={(e) => setFormData({...formData, projectAddress: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Project Name"
          value={formData.projectName}
          onChange={(e) => setFormData({...formData, projectName: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Metadata URI"
          value={formData.metadataURI}
          onChange={(e) => setFormData({...formData, metadataURI: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          disabled={loading}
        />
        <input
          type="number"
          placeholder="Energy Amount (kWh)"
          value={formData.energyAmount}
          onChange={(e) => setFormData({...formData, energyAmount: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          disabled={loading}
        />
      </div>
      <div className="mt-3 w-full">
        <ActionButton 
          onClick={handleSubmit}
          loading={loading}
          disabled={!formData.projectAddress || !formData.metadataURI || loading}
        >
          Mint IREC Token
        </ActionButton>
      </div>
    </div>
  );
};