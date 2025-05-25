import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  changeType?: 'positive' | 'negative';
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  change, 
  changeType = 'positive' 
}) => {
  const isPositive = changeType === 'positive' || change.startsWith('+');
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        <div className={`text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </div>
      </div>
    </div>
  );
};

export default StatCard;