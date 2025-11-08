import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
  color?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, change, changeType, color = 'amber' }) => {
  const changeColor = changeType === 'increase' ? 'text-green-400' : 'text-red-400';
  const changeIcon = changeType === 'increase' ? '↑' : '↓';
  
  const colorClasses = {
      amber: 'bg-amber-500/10 text-amber-400',
      blue: 'bg-blue-500/10 text-blue-400',
      yellow: 'bg-yellow-500/10 text-yellow-400',
      red: 'bg-red-500/10 text-red-400',
      green: 'bg-green-500/10 text-green-400',
  };
  
  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.amber;

  return (
    <div className="p-5 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${selectedColor}`}>
          {icon}
        </div>
      </div>
       {change && (
          <div className={`flex items-center text-sm font-medium ${changeColor} mt-2`}>
            <span>{changeIcon} {change}</span>
            <span className="text-gray-400 ml-1">vs last week</span>
          </div>
      )}
    </div>
  );
};

export default DashboardCard;