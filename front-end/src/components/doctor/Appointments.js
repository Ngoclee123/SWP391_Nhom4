import React, { useEffect, useState } from 'react';
import AppointmentService from '../../service/AppointmentService';

function Appointments({ doctorId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doctorId) {
      setError("Không có ID bác sĩ được cung cấp");
      setLoading(false);
      return;
    }

    setLoading(true);
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
      )}
    </div>
  );
}

export default Appointments;