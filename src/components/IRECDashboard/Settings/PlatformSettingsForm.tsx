
import { ActionButton } from '../shared/ActionButton';
import React from 'react';

interface PlatformSettingsFormProps {
  settings: {
    baseTokenURI: string;
    platformFee: string;
    minEnergyPerToken: string;
    contractAddress: string;
  };
  onSettingsChange: (settings: {
    baseTokenURI: string;
    platformFee: string;
    minEnergyPerToken: string;
  }) => void;
  onSave: () => void;
  loading: boolean;
}

export const PlatformSettingsForm: React.FC<PlatformSettingsFormProps> = ({
  settings,
  onSettingsChange,
  onSave,
  loading,
}) => {
  const handleChange = (field: string, value: string) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Settings</h3>
      <div className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="baseTokenURI" className="block text-sm font-medium text-gray-700 mb-1">
            Base Token URI
          </label>
          <input
            id="baseTokenURI"
            type="text"
            value={settings.baseTokenURI}
            onChange={(e) => handleChange('baseTokenURI', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label htmlFor="platformFee" className="block text-sm font-medium text-gray-700 mb-1">
            Platform Fee (%)
          </label>
          <input
            id="platformFee"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={settings.platformFee}
            onChange={(e) => handleChange('platformFee', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label htmlFor="minEnergyPerToken" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Energy per Token (MWh)
          </label>
          <input
            id="minEnergyPerToken"
            type="number"
            value={settings.minEnergyPerToken}
            onChange={(e) => handleChange('minEnergyPerToken', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Contract Address
          </label>
          <input
            id="contractAddress"
            type="text"
            readOnly
            value={settings.contractAddress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
          />
        </div>
        <div className="mt-4">
          <ActionButton onClick={onSave} loading={loading}>
            Save Changes
          </ActionButton>
        </div>
      </div>
    </div>
  );
};