import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

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