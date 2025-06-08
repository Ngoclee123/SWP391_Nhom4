import React from 'react';

const Profile = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Hồ sơ chuyên môn</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Họ tên</label>
          <input
            type="text"
            className="mt-1 p-2 w-full border rounded"
            placeholder="Nguyen Van A"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Chuyên khoa</label>
          <input
            type="text"
            className="mt-1 p-2 w-full border rounded"
            placeholder="Nhi khoa"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Chứng chỉ</label>
          <textarea
            className="mt-1 p-2 w-full border rounded"
            placeholder="Danh sách chứng chỉ, bằng cấp"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium">Kinh nghiệm</label>
          <textarea
            className="mt-1 p-2 w-full border rounded"
            placeholder="Mô tả kinh nghiệm làm việc"
          ></textarea>
        </div>
      </div>
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Cập nhật hồ sơ
      </button>
    </div>
  );
};

export default Profile;