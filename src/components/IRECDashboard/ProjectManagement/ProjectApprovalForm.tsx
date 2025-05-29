
import { ActionButton } from '../shared/ActionButton';

interface ProjectApprovalFormProps {
  projectAddress: string;
  onAddressChange: (address: string) => void;
  onApprove: () => void;
}

export const ProjectApprovalForm: React.FC<ProjectApprovalFormProps> = ({
  projectAddress,
  onAddressChange,
  onApprove,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        placeholder="Enter project address (0x...)"
        value={projectAddress}
        onChange={(e) => onAddressChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
      <ActionButton onClick={onApprove} variant="success">
        Approve
      </ActionButton>
    </div>
  );
};