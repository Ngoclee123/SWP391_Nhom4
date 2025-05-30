import React from 'react';

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  waiting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  online: 'bg-green-100 text-green-800 border-green-200',
  offline: 'bg-gray-100 text-gray-800 border-gray-200',
  busy: 'bg-red-100 text-red-800 border-red-200'
};

const STATUS_LABELS = {
  confirmed: 'Đã xác nhận',
  waiting: 'Chờ xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  online: 'Trực tuyến',
  offline: 'Ngoại tuyến',
  busy: 'Bận rộn'
};

const StatusBadge = React.memo(({ status, type = 'appointment' }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[status] || STATUS_STYLES.cancelled}`}>
    {STATUS_LABELS[status] || 'Không xác định'}
  </span>
));

export default StatusBadge;