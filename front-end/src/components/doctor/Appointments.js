import React, { useEffect, useState } from 'react';
import DoctorDashboardService from '../../service/DoctorDashboardService';

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
    DoctorDashboardService.getAppointmentsByDoctorId(doctorId)
      .then((data) => {
        setAppointments(data || []);
        setLoading(false);
        console.log("Appointments data:", data);
      })
      .catch((err) => {
        setError("Không thể tải lịch hẹn");
        setLoading(false);
        console.error("Error fetching appointments:", err);
      });
  }, [doctorId]);

  if (loading) return <div className="text-center text-gray-500">Đang tải lịch hẹn...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Lịch hẹn</h3>
      {appointments.length === 0 ? (
        <p className="text-gray-500">Không có lịch hẹn</p>
      ) : (
        <ul>
          {appointments.map((app) => (
            <li key={app.id}>{app.date} - {app.patientName}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Appointments;