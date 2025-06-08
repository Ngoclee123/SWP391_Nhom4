import React from 'react';

const Appointments = () => {
  const appointments = [
    { id: 1, patient: "Nguyen Van B", date: "2025-06-01", time: "08:00", status: "Chưa xác nhận" },
    { id: 2, patient: "Tran Thi C", date: "2025-06-01", time: "09:00", status: "Đã xác nhận" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Lịch hẹn hôm nay</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Bệnh nhân</th>
            <th className="p-2">Ngày</th>
            <th className="p-2">Giờ</th>
            <th className="p-2">Trạng thái</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id} className="border-t">
              <td className="p-2">{appt.patient}</td>
              <td className="p-2">{appt.date}</td>
              <td className="p-2">{appt.time}</td>
              <td className="p-2">{appt.status}</td>
              <td className="p-2">
                <button className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600">
                  Xác nhận
                </button>
                <button className="bg-red-500 text-white px-2 py-1 rounded mr-2 hover:bg-red-600">
                  Hủy
                </button>
                <button className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
                  Sửa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Xem tất cả
      </button>
    </div>
  );
};

export default Appointments;