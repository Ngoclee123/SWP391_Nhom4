import React from 'react';

const Schedule = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Cập nhật lịch làm việc</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium">Chọn ngày</label>
        <input type="date" className="mt-1 p-2 w-full border rounded" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Thời gian trống</label>
        <input
          type="time"
          className="mt-1 p-2 w-full border rounded"
          placeholder="08:00 - 10:00"
        />
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Thêm lịch
      </button>
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Lịch hiện tại</h3>
        <ul className="mt-2 space-y-2">
          <li className="p-2 bg-gray-50 rounded">2025-06-01: 08:00 - 10:00</li>
          <li className="p-2 bg-gray-50 rounded">2025-06-01: 14:00 - 16:00</li>
        </ul>
      </div>
    </div>
  );
};

export default Schedule;