import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

const SearchAndFilter = React.memo(({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, onClear }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm bệnh nhân, bác sĩ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      
      <div className="flex gap-2">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[150px]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="waiting">Chờ xác nhận</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        
        <button
          onClick={onClear}
          className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          title="Xóa bộ lọc"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
));

export default SearchAndFilter;