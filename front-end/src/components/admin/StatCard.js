import React from 'react';

const StatCard = React.memo(({ stat }) => {
  const IconComponent = stat.icon;
  
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Content */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              {stat.title}
            </p>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {stat.value.toLocaleString()}
            </p>
            <div className="flex items-center">
              {stat.change && (
                <span className={`text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              )}
              {/* <span className="text-sm text-gray-500 ml-2 font-medium">
                so với tháng trước
              </span> */}
            </div>
          </div>
          
          {/* Icon */}
          <div className={`p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-all duration-300 ${
            stat.color || 'bg-gradient-to-br from-blue-500 to-blue-600'
          }`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      
      {/* Gradient overlay */}
      <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
});

export default StatCard;