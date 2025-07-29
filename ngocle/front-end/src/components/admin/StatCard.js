import React from 'react';

const StatCard = React.memo(({ stat }) => {
  const IconComponent = stat.icon;
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change}
            </span>
            <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
          </div>
        </div>
        <div className={`${stat.color} p-4 rounded-xl shadow-lg`}>
          <IconComponent className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
});

export default StatCard;