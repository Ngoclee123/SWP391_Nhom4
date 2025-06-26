import React, { useEffect, useState } from 'react';
import DoctorDashboardService from '../../service/DoctorDashboardService';

function Appointments({ doctorId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

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

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-blue-600 font-medium">Đang tải lịch hẹn...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-red-200">
      <div className="text-center text-red-600">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="font-medium">{error}</p>
      </div>
    </div>
  );

  const filterButtons = [
    { id: 'all', label: 'Tất cả', icon: '📋', color: 'from-gray-500 to-gray-600' },
    { id: 'today', label: 'Hôm nay', icon: '📅', color: 'from-blue-500 to-cyan-500' },
    { id: 'upcoming', label: 'Sắp tới', icon: '⏰', color: 'from-green-500 to-emerald-500' },
    { id: 'completed', label: 'Hoàn thành', icon: '✅', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Quản lý lịch hẹn
            </h3>
            <p className="text-gray-600">Theo dõi và quản lý tất cả các cuộc hẹn của bạn</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            ➕ Thêm lịch hẹn mới
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/20">
        <div className="flex flex-wrap gap-3">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                filter === btn.id
                  ? `bg-gradient-to-r ${btn.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không có lịch hẹn</h3>
            <p className="text-gray-500 mb-6">Chưa có cuộc hẹn nào được đặt</p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300">
              Tạo lịch hẹn mới
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((app, index) => (
              <div key={app.id} className="p-6 hover:bg-blue-50/50 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {app.patientName || 'Bệnh nhân'}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        📅 {app.date || 'Chưa xác định'} • 🕐 {app.time || 'Chưa xác định'}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {app.reason || 'Khám định kỳ'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === 'completed' ? 'bg-green-100 text-green-700' :
                      app.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {app.status === 'completed' ? '✅ Hoàn thành' :
                       app.status === 'cancelled' ? '❌ Đã hủy' : '⏰ Đang chờ'}
                    </span>
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
                        ✏️
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-colors">
                        📞
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">
              📋
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
              <p className="text-sm text-gray-600">Tổng lịch hẹn</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white">
              ⏰
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {appointments.filter(app => app.status !== 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Đang chờ</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
              ✅
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {appointments.filter(app => app.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Hoàn thành</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Appointments;