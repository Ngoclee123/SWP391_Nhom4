import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

<<<<<<< HEAD
export default function SearchAndFilter({ searchTerm, setSearchTerm, genderFilter, setGenderFilter, onClear }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <input
        type="text"
        className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Tìm kiếm theo tên hoặc giới tính..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <select
        className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={genderFilter}
        onChange={e => setGenderFilter(e.target.value)}
      >
        <option value="all">Tất cả giới tính</option>
        <option value="Nam">Nam</option>
        <option value="Nữ">Nữ</option>
      </select>
      <button
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
        onClick={onClear}
      >
        Xóa lọc
      </button>
    </div>
  );
}
=======
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
>>>>>>> ngocle_new
