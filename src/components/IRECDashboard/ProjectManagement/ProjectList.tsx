
import { ActionButton } from '../shared/ActionButton';
import type { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  loading: {
    approving: Set<string>;
  };
  onApproveProject: (address: string) => void;
  onRevokeProject: (address: string) => void;
  onRemoveProject: (address: string) => void;
  userPermissions: {
    isSuperAdmin: boolean;
    isInitialSuperAdmin: boolean;
  };
  formatAddress: (addr: string) => string;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  loading,
  onApproveProject,
  onRevokeProject,
  onRemoveProject,
  userPermissions,
  formatAddress,
}) => {
  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Energy (MWh)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.address} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {formatAddress(project.address)}
                  </div>
                </td>
                <td>{project.energyGenerated?.toLocaleString()}</td>
                <td>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.approved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {project.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="space-x-2">
                  {!project.approved ? (
                    <ActionButton 
                      onClick={() => onApproveProject(project.address)}
                      loading={loading.approving.has(project.address)}
                      variant="success"
                    >
                      Approve
                    </ActionButton>
                  ) : (
                    <ActionButton 
                      onClick={() => onRevokeProject(project.address)}
                      loading={loading.approving.has(project.address)}
                      variant="warning"
                    >
                      Revoke
                    </ActionButton>
                  )}
                  {(userPermissions.isSuperAdmin || userPermissions.isInitialSuperAdmin) && (
                    <ActionButton 
                      onClick={() => onRemoveProject(project.address)}
                      variant="danger"
                    >
                      Remove
                    </ActionButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};