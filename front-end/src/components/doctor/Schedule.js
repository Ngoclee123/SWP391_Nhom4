import React, { useEffect, useState } from 'react';
import DoctorDashboardService from "../../service/DoctorDashboardService";
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

function Schedule({ doctorId }) {
  const [schedule, setSchedule] = useState([]);
  const [doctorName, setDoctorName] = useState('');
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

    // Lấy thông tin bác sĩ
    DoctorDashboardService.getDoctorById(doctorId)
      .then((doctorData) => {
        setDoctorName(doctorData.name || `Bác sĩ ${doctorId}`);
      })
      .catch((err) => {
        console.error("Error fetching doctor:", err);
        setDoctorName(`Bác sĩ ${doctorId}`);
      });

    // Lấy lịch làm việc
    DoctorDashboardService.getScheduleByDoctorId(doctorId)
      .then((data) => {
        console.log("API response for schedule:", data);
        if (Array.isArray(data)) {
          setSchedule(data);
        } else {
          setSchedule([]);
          console.warn("Dữ liệu không phải mảng:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải lịch làm việc: " + (err.message || "Lỗi không rõ"));
        setLoading(false);
        console.error("Error fetching schedule:", err);
      });
  }, [doctorId]);

  if (loading) return <div className="text-center text-gray-500">Đang tải lịch làm việc...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <FaCalendarAlt className="mr-2" /> Lịch làm việc - {doctorName} (ID: {doctorId})
      </h3>
      {schedule.length === 0 ? (
        <p className="text-gray-500">Chưa có lịch làm việc</p>
      ) : (
        <ul className="space-y-2">
          {schedule.map((item) => {
            const start = new Date(item.startTime);
            const end = new Date(item.endTime);
            const offset = 7 * 60 * 60 * 1000; // UTC+7
            const startLocal = new Date(start.getTime() + offset);
            const endLocal = new Date(end.getTime() + offset);
            return (
              <li
                key={item.id}
                className="p-3 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition"
              >
                <div>
                  <span className="font-medium">
                    {startLocal.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} -{" "}
                    {endLocal.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} (UTC+7)
                  </span>
                  <span className="ml-2 text-gray-600">({item.status})</span>
                </div>
                <FaClock className="text-gray-400" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Schedule;