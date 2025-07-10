import React, { useEffect, useState } from 'react';
import AppointmentService from '../../service/AppointmentService';

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

function Appointments({ doctorId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< Updated upstream
  const [error, setError] = useState(null);
=======
  const [filter, setFilter] = useState('all');
>>>>>>> Stashed changes

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
<<<<<<< Updated upstream
    setError(null);
    const token = localStorage.getItem('token');
    AppointmentService.getAppointmentsByDoctorId(doctorId, token)
      .then((data) => {
        setAppointments(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải lịch hẹn");
        setLoading(false);
        console.error("Error fetching appointments:", err);
      });
  }, [doctorId]);

  const handleStatusChange = (appointmentId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Vui lòng đăng nhập lại!');

    AppointmentService.updateAppointmentStatus(appointmentId, newStatus, token)
      .then(() => {
        setAppointments(prev =>
          prev.map(app =>
            app.id === appointmentId ? { ...app, status: newStatus } : app
          )
        );
        alert('Cập nhật trạng thái thành công!');
      })
      .catch(err => {
        console.error("Lỗi khi cập nhật trạng thái:", err);
        alert('Có lỗi xảy ra, vui lòng thử lại.');
      });
  };

  if (loading) return <div className="text-center text-gray-500">Đang tải lịch hẹn...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Lịch hẹn</h3>
      {appointments.length === 0 ? (
        <p className="text-gray-500">Không có lịch hẹn</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {appointments.map((app) => (
            <li key={app.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">Bệnh nhân ID: {app.patientId}</p>
                <p className="text-sm text-gray-600">Ngày: {new Date(app.appointmentDate).toLocaleString()}</p>
                <p className="text-sm">Trạng thái: <span className="font-semibold">{app.status}</span></p>
              </div>
              {app.status === 'Pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(app.id, 'Confirmed')}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Xác nhận
                  </button>
                  <button
                    onClick={() => handleStatusChange(app.id, 'Cancelled')}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
=======
    DoctorDashboardService.getAppointmentsByDoctorId(doctorId)
      .then((res) => setAppointments(res.data || res))
      .finally(() => setLoading(false));
  }, [doctorId]);

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
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => (
                <tr key={a.appointmentId} className="border-b hover:bg-blue-50">
                  <td className="p-3">{a.appointmentId}</td>
                  <td className="p-3">{a.patientId}</td>
                  <td className="p-3">{a.appointmentDate ? new Date(a.appointmentDate).toLocaleString("vi-VN") : '-'}</td>
                  <td className="p-3">{a.duration} phút</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[a.status] || "bg-gray-100 text-gray-700"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3">{a.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAppointments.length === 0 && (
            <div className="text-center text-gray-500 py-8">Không có lịch hẹn nào.</div>
          )}
        </div>
>>>>>>> Stashed changes
      )}
    </div>
  );
}

export default Appointments;