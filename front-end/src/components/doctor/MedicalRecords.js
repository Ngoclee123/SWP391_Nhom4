import React from 'react';

const MedicalRecords = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Hồ sơ khám bệnh</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium">Tên bệnh nhân</label>
        <input
          type="text"
          className="mt-1 p-2 w-full border rounded"
          placeholder="Nguyen Van B"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Ghi chú</label>
        <textarea
          className="mt-1 p-2 w-full border rounded"
          placeholder="Ghi chú về tình trạng sức khỏe"
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Đơn thuốc</label>
        <textarea
          className="mt-1 p-2 w-full border rounded"
          placeholder="Danh sách thuốc và liều lượng"
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Theo dõi sức khỏe</label>
        <textarea
          className="mt-1 p-2 w-full border rounded"
          placeholder="Cập nhật tình trạng sức khỏe trẻ"
        ></textarea>
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Lưu hồ sơ
      </button>
    </div>
  );
};

export default MedicalRecords;