import React from 'react';

const StatusBadge = React.memo(({ status, size = 'md' }) => {
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();
    
    switch (statusLower) {
      case 'confirmed':
      case 'active':
      case 'online':
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200',
          dot: 'bg-green-500'
        };
      case 'pending':
      case 'waiting':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          dot: 'bg-yellow-500'
        };
      case 'cancelled':
      case 'inactive':
      case 'offline':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200',
          dot: 'bg-red-500'
        };
      case 'processing':
      case 'busy':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-200',
          dot: 'bg-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          dot: 'bg-gray-500'
        };
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-sm';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span className={`
      inline-flex items-center space-x-2 ${sizeClasses} 
      ${config.bg} ${config.text} ${config.border}
      border rounded-full font-semibold shadow-sm
      transition-all duration-200 hover:shadow-md
    `}>
      <div className={`w-2 h-2 ${config.dot} rounded-full`}></div>
      <span className="font-medium">
        {status === 'confirmed' && 'Đã xác nhận'}
        {status === 'pending' && 'Chờ xác nhận'}
        {status === 'cancelled' && 'Đã hủy'}
        {status === 'completed' && 'Hoàn thành'}
        {status === 'processing' && 'Đang xử lý'}
        {status === 'active' && 'Hoạt động'}
        {status === 'inactive' && 'Không hoạt động'}
        {status === 'online' && 'Trực tuyến'}
        {status === 'offline' && 'Ngoại tuyến'}
        {status === 'busy' && 'Bận rộn'}
        {status === 'waiting' && 'Chờ xử lý'}
        {!['confirmed', 'pending', 'cancelled', 'completed', 'processing', 'active', 'inactive', 'online', 'offline', 'busy', 'waiting'].includes(status?.toLowerCase()) && status}
      </span>
    </span>
  );
});

export default StatusBadge;