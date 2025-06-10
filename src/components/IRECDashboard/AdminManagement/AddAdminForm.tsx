import { useState } from 'react';
import { ActionButton } from '../shared/ActionButton';
import { AddressDisplay } from '../shared/AddressDisplay';

interface AddAdminFormProps {
  formData: {
    address: string;
    role: string;
    name: string;
  };
  onFormChange: (data: {
    address: string;
    role: string;
    name: string;
  }) => void;
  onGrantRole: (role: string) => void;
  loading: {
    grantingRole: Set<string>;
  };
  userPermissions: {
    canGrantAdmin: boolean;
    canGrantSuperAdmin: boolean;
  };
  className?: string;
}

export const AddAdminForm: React.FC<AddAdminFormProps> = ({
  formData,
  onFormChange,
  onGrantRole,
  loading,
  userPermissions,
  className = '',
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmit = () => {
    console.log('Submit clicked with form data:', formData);
    console.log('User permissions:', userPermissions);
    
    // Clear previous validation errors
    setValidationError(null);

    // Basic validation
    if (!formData.address || !formData.name) {
      setValidationError('Both address and name are required');
      return;
    }

    if (!validateAddress(formData.address)) {
      setValidationError('Invalid Ethereum address format');
      return;
    }

    // Fix: Correct role validation logic
    if (formData.role === 'SUPER_ADMIN_ROLE' && !userPermissions.canGrantSuperAdmin) {
      setValidationError('You do not have permission to grant super admin roles');
      return;
    }

    if (formData.role === 'ADMIN_ROLE' && !userPermissions.canGrantAdmin) {
      setValidationError('You do not have permission to grant admin roles');
      return;
    }

    // Name length validation
    if (formData.name.trim().length < 2) {
      setValidationError('Name must be at least 2 characters long');
      return;
    }

    // Check if currently granting to this address with this role
    const roleKey = `${formData.address}-${formData.role}`;
    if (loading.grantingRole.has(roleKey)) {
      console.log('Already granting role, skipping...');
      return;
    }

    console.log('Validation passed, calling onGrantRole with:', formData.role);
    onGrantRole(formData.role);
  };

  const handleAddressChange = (address: string) => {
    setValidationError(null);
    onFormChange({ ...formData, address: address.trim() });
  };

  const handleNameChange = (name: string) => {
    setValidationError(null);
    onFormChange({ ...formData, name });
  };

  const handleRoleChange = (role: string) => {
    setValidationError(null);
    onFormChange({ ...formData, role });
  };

  const isFormValid = formData.address && formData.name && formData.address.trim().length > 0;
  const roleKey = `${formData.address}-${formData.role}`;
  const isCurrentlyGranting = loading.grantingRole.has(roleKey);

  // Custom role badge component as fallback
  const RoleBadge = ({ role }: { role: string }) => {
    const isSuperAdmin = role === 'SUPER_ADMIN_ROLE' || role === 'DEFAULT_ADMIN_ROLE';
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isSuperAdmin
          ? 'bg-green-100 text-green-600 border border-green-200'
          : 'bg-green-100 text-green-600 border border-green-200'
      }`}>
        {isSuperAdmin ? ' Super Admin' : ' Regular Admin'}
      </span>
    );
  };

  return (
    <div className={`bg-gray-50 p-4 rounded-lg border ${className}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Admin</h4>
      <div className="space-y-3">
        {/* Address Input */}
        <div>
          <label htmlFor="adminAddress" className="block text-xs font-medium text-gray-700 mb-1">
            Ethereum Address *
          </label>
          <input
            id="adminAddress"
            type="text"
            placeholder="0x1234567890abcdef..."
            value={formData.address}
            onChange={(e) => handleAddressChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              validationError && validationError.includes('address') 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            disabled={isCurrentlyGranting}
          />
          {formData.address && validateAddress(formData.address) && (
            <div className="mt-1">
              <AddressDisplay 
                address={formData.address} 
                startLength={6} 
                endLength={4} 
                showCopy={false} 
              />
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label htmlFor="adminRole" className="block text-xs font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            id="adminRole"
            value={formData.role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-500"
            disabled={isCurrentlyGranting}
          >
            {!userPermissions.canGrantAdmin && !userPermissions.canGrantSuperAdmin && (
              <option value="" disabled>No permissions to grant roles</option>
            )}
            {userPermissions.canGrantAdmin && (
              <option value="ADMIN_ROLE">Regular Admin</option>
            )}
            {userPermissions.canGrantSuperAdmin && (
              <option value="SUPER_ADMIN_ROLE">Super Admin</option>
            )}
          </select>
          
          {/* Role Badge */}
          <div className="mt-2 flex items-center space-x-2">
            <RoleBadge role={formData.role} />
            <span className="text-xs text-gray-500">
              {(formData.role === 'SUPER_ADMIN_ROLE' || formData.role === 'DEFAULT_ADMIN_ROLE')
                ? 'Can grant/revoke admin roles' 
                : 'Limited permissions'
              }
            </span>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label htmlFor="adminName" className="block text-xs font-medium text-gray-700 mb-1">
            Display Name *
          </label>
          <input
            id="adminName"
            type="text"
            placeholder="e.g., John Smith"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              validationError && validationError.includes('name') 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            disabled={isCurrentlyGranting}
          />
          <p className="text-xs text-gray-500 mt-1">
            This name is for display purposes only
          </p>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <p className="text-red-700 text-xs">{validationError}</p>
          </div>
        )}

        {/* Permission Warning */}
        {!userPermissions.canGrantAdmin && !userPermissions.canGrantSuperAdmin && (
          <div className="bg-green-50 border border-green-200 rounded-md p-2">
            <p className="text-orange-700 text-xs">
              You do not have permission to grant any admin roles
            </p>
          </div>
        )}

        {/* Submit Button */}
        <ActionButton
          onClick={handleSubmit}
          loading={isCurrentlyGranting}
          disabled={!isFormValid || (!userPermissions.canGrantAdmin && !userPermissions.canGrantSuperAdmin)}
          variant={(formData.role === 'SUPER_ADMIN_ROLE' || formData.role === 'DEFAULT_ADMIN_ROLE') ? 'warning' : 'primary'}
        >
          {isCurrentlyGranting 
            ? 'Granting Role...' 
            : (formData.role === 'SUPER_ADMIN_ROLE' || formData.role === 'DEFAULT_ADMIN_ROLE')
              ? 'Grant Super Admin Role' 
              : 'Grant Admin Role'
          }
        </ActionButton>

        {/* Info Text */}
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          <div className="flex items-start space-x-2">
            <span className="text-green-600 mt-0.5">ℹ️</span>
            <p>
              {(formData.role === 'SUPER_ADMIN_ROLE' || formData.role === 'DEFAULT_ADMIN_ROLE')
                ? 'Super admins have full administrative privileges including the ability to grant and revoke admin roles from other users.'
                : 'Regular admins have limited permissions and cannot manage other admin roles. They can approve projects and mint tokens.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};