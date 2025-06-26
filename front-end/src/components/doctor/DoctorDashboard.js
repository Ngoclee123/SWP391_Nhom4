import React, { useState, useEffect } from 'react';
import Profile from './Profile';
import Schedule from './Schedule';
import Appointments from './Appointments';
import MedicalRecords from './MedicalRecords';
import Feedback from './Feedback';
import DoctorDashboardService from '../../service/DoctorDashboardService';
import UserService from '../../service/userService';
import { jwtDecode } from 'jwt-decode';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorId, setDoctorId] = useState(null);
  const [userName, setUserName] = useState('Doctor User');
  const [stats, setStats] = useState({
    totalPatients: 0,
    todaysAppointments: 0,
    completedWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorIdAndStats = async () => {
      try {
        const token = UserService.getToken();
        if (!token) {
          setError('Vui lòng đăng nhập lại để truy cập dashboard.');
          setLoading(false);
          window.location.href = '/login';
          return;
        }

        const decoded = jwtDecode(token);
        const accountId = decoded.accountId;
        const userNameFromToken = decoded.fullName || decoded.sub || 'Doctor User';
        console.log('Decoded token - accountId:', accountId, 'User Name:', userNameFromToken);

        setUserName(userNameFromToken);

        const doctorData = await DoctorDashboardService.getDoctorByAccountId(accountId);
        console.log('Doctor data received:', doctorData);

        if (doctorData && doctorData.id) {
          setDoctorId(doctorData.id);
          const overviewData = {
            totalPatients: 1234,
            todaysAppointments: 45,
            completedWeek: 89,
          };
          setStats(overviewData);
        } else {
          setError('Không tìm thấy ID bác sĩ.');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải thông tin bác sĩ.';
        setError(errorMessage);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorIdAndStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-blue-600 font-medium text-lg">Đang tải dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-red-200 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-red-600 font-medium text-lg">{error}</p>
      </div>
    </div>
  );

  if (!doctorId) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-200 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-gray-600 font-medium text-lg">Không có ID bác sĩ</p>
      </div>
    </div>
  );

  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: '📊', color: 'from-blue-500 to-cyan-500' },
    { id: 'appointments', label: 'Lịch hẹn', icon: '📅', color: 'from-green-500 to-emerald-500' },
    { id: 'schedule', label: 'Lịch làm việc', icon: '⏰', color: 'from-purple-500 to-pink-500' },
    { id: 'records', label: 'Hồ sơ khám bệnh', icon: '📋', color: 'from-orange-500 to-red-500' },
    { id: 'feedback', label: 'Phản hồi', icon: '💬', color: 'from-teal-500 to-blue-500' },
    { id: 'profile', label: 'Hồ sơ chuyên môn', icon: '👤', color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">🏥</span>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BabyHealthHub
                </h2>
                <p className="text-xs text-gray-500">Doctor Dashboard</p>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl mb-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <div>
                  <p className="font-semibold">{userName}</p>
                  <p className="text-xs opacity-80">Bác sĩ chuyên khoa</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    activeTab === item.id
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Bảng điều khiển bác sĩ
                </h1>
                <p className="text-gray-600 mt-1">Quản lý và theo dõi hoạt động của bạn</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="p-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <span className="text-lg">🔔</span>
                  </button>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Chào mừng trở lại! 👋
                      </h3>
                      <p className="text-gray-600 text-lg">Tổng quan về hoạt động hôm nay của bạn</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Ngày hôm nay</p>
                      <p className="text-lg font-semibold text-gray-800">{new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                        👥
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-800">{stats.totalPatients}</p>
                        <p className="text-sm text-gray-600">Tổng bệnh nhân</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 text-sm">↗️ +12%</span>
                      <span className="text-gray-500 text-sm">so với tháng trước</span>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                        📅
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-800">{stats.todaysAppointments}</p>
                        <p className="text-sm text-gray-600">Lịch hẹn hôm nay</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 text-sm">↗️ +8%</span>
                      <span className="text-gray-500 text-sm">so với hôm qua</span>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                        ✅
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-800">{stats.completedWeek}</p>
                        <p className="text-sm text-gray-600">Hoàn thành tuần</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 text-sm">↗️ +15%</span>
                      <span className="text-gray-500 text-sm">so với tuần trước</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20">
                  <h4 className="text-2xl font-bold text-gray-800 mb-6">Thao tác nhanh</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="text-2xl mb-2">📋</div>
                      <div className="font-semibold">Tạo lịch hẹn</div>
                    </button>
                    <button className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="text-2xl mb-2">📝</div>
                      <div className="font-semibold">Viết hồ sơ</div>
                    </button>
                    <button className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="text-2xl mb-2">💊</div>
                      <div className="font-semibold">Kê đơn thuốc</div>
                    </button>
                    <button className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="text-2xl mb-2">📞</div>
                      <div className="font-semibold">Liên hệ khẩn</div>
                    </button>
                  </div>
                </div>

                {/* Status Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
                    <h4 className="text-xl font-semibold mb-4 text-gray-800">Trạng thái hoạt động</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Trạng thái:</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          🟢 Đang hoạt động
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Giờ làm việc:</span>
                        <span className="text-gray-600">8:00 - 17:00</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Lịch hẹn tiếp theo:</span>
                        <span className="text-blue-600 font-medium">14:30</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
                    <h4 className="text-xl font-semibold mb-4 text-gray-800">Thông báo mới</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Lịch hẹn khẩn cấp</p>
                          <p className="text-xs text-gray-500">5 phút trước</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Tin nhắn từ bệnh nhân</p>
                          <p className="text-xs text-gray-500">10 phút trước</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Báo cáo hoàn thành</p>
                          <p className="text-xs text-gray-500">30 phút trước</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'appointments' && <Appointments doctorId={doctorId} />}
            {activeTab === 'schedule' && <Schedule doctorId={doctorId} />}
            {activeTab === 'records' && <MedicalRecords doctorId={doctorId} />}
            {activeTab === 'feedback' && <Feedback doctorId={doctorId} />}
            {activeTab === 'profile' && <Profile doctorId={doctorId} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;