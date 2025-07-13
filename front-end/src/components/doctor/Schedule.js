import React, { useEffect, useState } from 'react';
import DoctorDashboardService from "../../service/DoctorDashboardService";
import { FaCalendarAlt, FaClock, FaEdit, FaPlus } from 'react-icons/fa';

function Schedule({ doctorId }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ startTime: "", endTime: "", status: "Available" });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    DoctorDashboardService.getScheduleByDoctorId(doctorId)
      .then((data) => {
        setSchedule(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setSchedule([]);
        setLoading(false);
      });
  }, [doctorId]);

  const fetchSchedules = async () => {
    setLoading(true);
    const data = await DoctorDashboardService.getScheduleByDoctorId(doctorId);
    setSchedule(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await DoctorDashboardService.updateSchedule(editId, form);
    } else {
      await DoctorDashboardService.addSchedule(doctorId, form);
    }
    setForm({ startTime: "", endTime: "", status: "Available" });
    setEditId(null);
    setShowForm(false);
    fetchSchedules();
  };

  const handleEdit = (item) => {
    setForm({
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleAdd = () => {
    setForm({ startTime: "", endTime: "", status: "Available" });
    setEditId(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-blue-600 font-medium animate-pulse">Đang tải lịch làm việc...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-blue-600 flex items-center mb-6">
        <FaCalendarAlt className="mr-2" /> Lịch làm việc của bạn (ID: {doctorId})
        <button className="ml-auto bg-blue-500 text-white px-3 py-1 rounded flex items-center" onClick={handleAdd}>
          <FaPlus className="mr-1" /> Thêm mới
        </button>
      </h3>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-blue-50 p-4 rounded-xl shadow">
          <div className="flex flex-col md:flex-row gap-4 mb-2">
            <input
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              type="datetime-local"
              className="border rounded px-2 py-1"
              required
            />
            <input
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              type="datetime-local"
              className="border rounded px-2 py-1"
              required
            />
            <select name="status" value={form.status} onChange={handleChange} className="border rounded px-2 py-1">
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-1 rounded">
            {editId ? "Cập nhật" : "Thêm mới"}
          </button>
          <button type="button" className="ml-2 px-4 py-1 rounded border" onClick={() => setShowForm(false)}>
            Hủy
          </button>
        </form>
      )}
      {schedule.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          <FaClock className="inline-block text-3xl mb-2" />
          <div>Chưa có lịch làm việc</div>
        </div>
      ) : (
        <ul className="space-y-4">
          {schedule.map((item) => {
            const start = new Date(item.startTime);
            const end = new Date(item.endTime);
            return (
              <li
                key={item.id}
                className="flex items-center justify-between bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4 shadow hover:shadow-lg transition"
              >
                <div>
                  <div className="font-semibold text-lg text-blue-700">
                    {start.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                  <div className="text-gray-700 mt-1">
                    <FaClock className="inline-block mr-1 text-blue-500" />
                    {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${item.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {item.status === 'Available' ? 'Sẵn sàng' : item.status}
                </span>
                <button className="ml-4 text-blue-600 hover:text-blue-900" onClick={() => handleEdit(item)}>
                  <FaEdit /> Sửa
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Schedule;