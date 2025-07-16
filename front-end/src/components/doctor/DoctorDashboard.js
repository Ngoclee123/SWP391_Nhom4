import React, { useState, useEffect } from 'react';
import Profile from './Profile';
import Schedule from './Schedule';
import Appointments from './Appointments';
import MedicalRecords from './MedicalRecords';
import Feedback from './Feedback';
import DoctorDashboardService from '../../service/DoctorDashboardService';
import UserService from '../../service/userService';
import { jwtDecode } from 'jwt-decode';
import ChatDoctor from './ChatDoctor';

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    // Main data fetching
    useEffect(() => {
        const initializeDashboard = async () => {
            try {
                const token = UserService.getToken();
                if (!token) {
                    setError('Vui lòng đăng nhập lại');
                    window.location.href = '/login';
                    return;
                }

                const decoded = jwtDecode(token);
                const accountId = decoded.accountId;
                const userNameFromToken = decoded.fullName || decoded.sub || 'Doctor User';
                setUserName(userNameFromToken);

                const doctorData = await DoctorDashboardService.getDoctorByAccountId(accountId);
                if (doctorData?.id) {
                    setDoctorId(doctorData.id);
                    setStats({
                        totalPatients: 1234,
                        todaysAppointments: 45,
                        completedWeek: 89,
                    });
                } else {
                    setError('Không tìm thấy ID bác sĩ');
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Không thể tải thông tin bác sĩ';
                setError(errorMessage);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            } finally {
                setLoading(false);
            }
        };

        initializeDashboard();
    }, []);

    // Loading and error states
    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-blue-600 font-medium">Đang tải...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-red-600 font-medium">{error}</p>
            </div>
        </div>
    );

    if (!doctorId) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 font-medium">Không có ID bác sĩ</p>
            </div>
        </div>
    );

    const menuItems = [
        { id: 'overview', label: 'Tổng quan', icon: '📊' },
        { id: 'appointments', label: 'Lịch hẹn', icon: '📅' },
        { id: 'schedule', label: 'Lịch làm việc', icon: '⏰' },
        { id: 'records', label: 'Hồ sơ khám bệnh', icon: '📋' },
        { id: 'feedback', label: 'Phản hồi', icon: '💬' },
        { id: 'profile', label: 'Hồ sơ chuyên môn', icon: '👤' },
        { id: 'messages', label: 'Tin nhắn', icon: '📩' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-80 bg-white/80 backdrop-blur-xl shadow-2xl">
                    <div className="p-6">
                        <div className="flex items-center mb-8">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-xl">🏥</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-blue-600">BabyHealthHub</h2>
                                <p className="text-xs text-gray-500">Doctor Dashboard</p>
                            </div>
                        </div>
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
                        <nav className="space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                                        activeTab === item.id
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
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

                {/* Main content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="bg-white/80 backdrop-blur-xl shadow-lg p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-blue-600">Bảng điều khiển bác sĩ</h1>
                                <p className="text-gray-600">Quản lý và theo dõi hoạt động</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleLogout}
                                    className="px-6 py-3 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition-all"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl">
                                    <h3 className="text-3xl font-bold text-blue-600 mb-2">Chào mừng trở lại! 👋</h3>
                                    <p className="text-gray-600">Tổng quan về hoạt động hôm nay</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                                                👥
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold">{stats.totalPatients}</p>
                                                <p className="text-sm text-gray-600">Tổng bệnh nhân</p>
                                            </div>
                                        </div>
                                        <div className="text-green-500 text-sm">↗️ +12% so với tháng trước</div>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                                                📅
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold">{stats.todaysAppointments}</p>
                                                <p className="text-sm text-gray-600">Lịch hẹn hôm nay</p>
                                            </div>
                                        </div>
                                        <div className="text-green-500 text-sm">↗️ +8% so với hôm qua</div>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                                                ✅
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold">{stats.completedWeek}</p>
                                                <p className="text-sm text-gray-600">Hoàn thành tuần</p>
                                            </div>
                                        </div>
                                        <div className="text-green-500 text-sm">↗️ +15% so với tuần trước</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appointments' && <Appointments doctorId={doctorId} />}
                        {activeTab === 'schedule' && doctorId && <Schedule doctorId={doctorId} />}
                        {activeTab === 'records' && <MedicalRecords doctorId={doctorId} />}
                        {activeTab === 'feedback' && <Feedback doctorId={doctorId} />}
                        {activeTab === 'profile' && <Profile doctorId={doctorId} />}
                        {activeTab === 'messages' && <ChatDoctor userName={userName} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;