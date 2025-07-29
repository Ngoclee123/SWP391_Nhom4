import React, { useEffect, useState } from 'react';
import DoctorDashboardService from '../../service/DoctorDashboardService';
import axiosClient from '../../api/axiosClient';

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
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ appointmentDate: '', duration: 30 });

  useEffect(() => {
    if (!doctorId) return;
    fetchAppointments();
  }, [doctorId]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await DoctorDashboardService.getAppointmentsByDoctorId(doctorId);
      setAppointments(res.data || res);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
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

  const handleEditAppointment = (appointment) => {
    setEditingId(appointment.id);
    const localDate = new Date(appointment.appointmentDate);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}T${hours}:${minutes}`;
    setEditForm({
      appointmentDate: dateStr,
      duration: appointment.duration || 30,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.appointmentDate || !editForm.duration) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (!window.confirm('Việc thay đổi thời lượng sẽ đẩy lui các lịch hẹn sau. Bạn có chắc chắn?')) {
      return;
    }

    setUpdatingId(editingId);
    try {
      const currentAppointment = appointments.find(a => a.id === editingId);
      if (!currentAppointment) {
        alert('Lịch hẹn không tồn tại!');
        return;
      }

      const currentDuration = currentAppointment.duration || 0;
      const newDuration = parseInt(editForm.duration);
      const deltaMinutes = newDuration - currentDuration; // Số phút tăng thêm

      // Tính appointmentTime mới dựa trên duration tăng
      const newAppointmentTime = new Date(currentAppointment.appointmentDate);
      newAppointmentTime.setMinutes(newAppointmentTime.getMinutes() + newDuration); // Thời gian kết thúc mới

      const appointmentDTO = {
        appointmentDate: editForm.appointmentDate, // Giữ nguyên ngày và giờ gốc
        appointmentTime: newAppointmentTime.toISOString().split('.')[0] + '+07:00', // Cập nhật thời gian kết thúc mới với offset
        duration: newDuration, // Gửi duration mới
      };
      console.log('Sending DTO to backend:', appointmentDTO);
      const response = await DoctorDashboardService.updateAppointment(editingId, appointmentDTO);
      console.log('Response from backend:', response);
      fetchAppointments();
      setEditingId(null);
    } catch (e) {
      console.error('Error updating appointment:', e);
      let errorMsg = 'Có lỗi xảy ra khi cập nhật lịch hẹn!';
      if (e.response) {
        if (e.response.status === 404) errorMsg = 'Lịch hẹn không tồn tại!';
        else if (e.response.status === 400) errorMsg = 'Dữ liệu không hợp lệ: ' + (e.response.data.message || e.message);
        else if (e.response.status === 401) errorMsg = 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!';
      }
      alert(errorMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ appointmentDate: '', duration: 30 });
  };

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
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        onClick={() => handleEditAppointment(a)}
                      >
                        Chỉnh sửa thời lượng
                      </button>
                    )}
                    {a.status === "Cancelled" && (
                      <span className="text-red-600 font-semibold">Đã hủy</span>
                    )}
                  </td>
                </tr>
              ))}
              {editingId && (
                <tr className="bg-gray-50">
                  <td colSpan="7" className="p-4">
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                      <h3 className="text-lg font-bold mb-2">Chỉnh sửa thời lượng lịch hẹn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Thời gian hẹn</label>
                          <input
                            type="datetime-local"
                            value={editForm.appointmentDate}
                            onChange={(e) => {
                              setEditForm(prev => ({ ...prev, appointmentDate: prev.appointmentDate }));
                            }}
                            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Thời lượng (phút)</label>
                          <input
                            type="number"
                            value={editForm.duration}
                            onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2"
                            min="15"
                            step="15"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                          onClick={handleSaveEdit}
                          disabled={updatingId === editingId}
                        >
                          {updatingId === editingId ? "Đang lưu..." : "Lưu"}
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                          onClick={handleCancelEdit}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
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