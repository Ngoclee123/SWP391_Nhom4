import React, { useEffect, useState } from 'react';
import DoctorDashboardService from '../../service/DoctorDashboardService';

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

function Appointments({ doctorId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!doctorId) return;
    fetchAppointments();
    // eslint-disable-next-line
  }, [doctorId]);

  const fetchAppointments = () => {
    setLoading(true);
    DoctorDashboardService.getAppointmentsByDoctorId(doctorId)
      .then((res) => setAppointments(res.data || res))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    setUpdatingId(appointmentId);
    try {
      await DoctorDashboardService.updateAppointmentStatus(appointmentId, status);
      fetchAppointments();
    } catch (e) {
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    } finally {
      setUpdatingId(null);
    }
  };

  // Lọc lịch hẹn theo filter
  const now = new Date();
  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(app.appointmentDate) > now && app.status !== 'Completed';
    if (filter === 'completed') return app.status === 'Completed';
    return true;
  });

  return (
    <div className="p-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">Lịch hẹn của tôi</h2>
      <div className="flex gap-3 mb-4">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl font-medium ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Tất cả ({appointments.length})</button>
        <button onClick={() => setFilter('upcoming')} className={`px-4 py-2 rounded-xl font-medium ${filter === 'upcoming' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Sắp tới ({appointments.filter(app => new Date(app.appointmentDate) > now && app.status !== 'Completed').length})</button>
        <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-xl font-medium ${filter === 'completed' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Hoàn thành ({appointments.filter(app => app.status === 'Completed').length})</button>
      </div>
      {loading ? (
        <div className="text-center text-blue-500">Đang tải...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead>
              <tr className="bg-blue-100 text-blue-700">
                <th className="p-3">ID</th>
                <th className="p-3">Bệnh nhân</th>
                <th className="p-3">Ngày hẹn</th>
                <th className="p-3">Thời lượng</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Ghi chú</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => (
                <tr key={a.id} className="border-b hover:bg-blue-50">
                  <td className="p-3">{a.id}</td>
                  <td className="p-3">{a.patientId}</td>
                  <td className="p-3">{a.appointmentDate ? new Date(a.appointmentDate).toLocaleString("vi-VN") : '-'}</td>
                  <td className="p-3">{a.duration} phút</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[a.status] || "bg-gray-100 text-gray-700"}`}>
                      {a.status === "Pending" ? "Chưa xác nhận" : a.status === "Confirmed" ? "Đã xác nhận" : a.status === "Cancelled" ? "Đã hủy" : a.status}
                    </span>
                  </td>
                  <td className="p-3">{a.notes}</td>
                  <td className="p-3 flex gap-2">
                    {a.status === "Pending" && (
                      <>
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                          disabled={updatingId === a.id}
                          onClick={() => handleUpdateStatus(a.id, "Confirmed")}
                        >
                          {updatingId === a.id ? "Đang xác nhận..." : "Xác nhận"}
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          disabled={updatingId === a.id}
                          onClick={() => handleUpdateStatus(a.id, "Cancelled")}
                        >
                          {updatingId === a.id ? "Đang hủy..." : "Hủy"}
                        </button>
                      </>
                    )}
                    {a.status === "Confirmed" && (
                      <span className="text-green-600 font-semibold">Đã xác nhận</span>
                    )}
                    {a.status === "Cancelled" && (
                      <span className="text-red-600 font-semibold">Đã hủy</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAppointments.length === 0 && (
            <div className="text-center text-gray-500 py-8">Không có lịch hẹn nào.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Appointments;