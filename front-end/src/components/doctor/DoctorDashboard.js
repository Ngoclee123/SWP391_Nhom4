import React, { useState, useEffect } from 'react';
import Profile from './Profile';
import Schedule from './Schedule';
import Appointments from './Appointments';
import MedicalRecords from './MedicalRecords';
import Feedback from './Feedback';
import DoctorDashboardService from "../../service/DoctorDashboardService";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hardcode doctorId để test
    const fetchedDoctorId = 1; // Giá trị cố định, đảm bảo có dữ liệu
    setDoctorId(fetchedDoctorId);
    setLoading(false);
  }, []);

  if (loading) return <div className="text-center text-gray-500">Đang tải...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!doctorId) return <div className="text-center text-red-500">Không có ID bác sĩ</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4">
        <div className="flex items-center mb-6">
          <img src="https://via.placeholder.com/40" alt="Logo" className="mr-2" />
          <h2 className="text-xl font-bold text-blue-600">BabyHealthHub</h2>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} flex items-center`}
                onClick={() => setActiveTab('overview')}
              >
                <span className="mr-2">📊</span> Tổng quan
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'appointments' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} flex items-center`}
                onClick={() => setActiveTab('appointments')}
              >
                <span className="mr-2">📅</span> Lịch hẹn
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'schedule' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} flex items-center`}
                onClick={() => setActiveTab('schedule')}
              >
                <span className="mr-2">⏰</span> Lịch làm việc
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'records' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} flex items-center`}
                onClick={() => setActiveTab('records')}
              >
                <span className="mr-2">📋</span> Hồ sơ khám bệnh
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'feedback' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} flex items-center`}
                onClick={() => setActiveTab('feedback')}
              >
                <span className="mr-2">💬</span> Phản hồi
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} flex items-center`}
                onClick={() => setActiveTab('profile')}
              >
                <span className="mr-2">👤</span> Hồ sơ chuyên môn
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bảng điều khiển bác sĩ</h1>
          <div className="flex items-center">
            <span className="mr-2 text-red-500">🔔 3</span>
            <span className="text-gray-600">Doctor User</span>
            <img src="https://via.placeholder.com/30" alt="User" className="ml-2 rounded-full" />
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Tổng bệnh nhân</h3>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
              <p className="text-green-600">+12% so với tháng trước</p>
            </div>
<<<<<<< Updated upstream
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Lịch hẹn hôm nay</h3>
              <p className="text-2xl font-bold text-blue-600">45</p>
              <p className="text-green-600">+8% so với tháng trước</p>
=======
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
                        
                        {/* Doctor info */}
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
                    {/* Header */}
                    <div className="bg-white/80 backdrop-blur-xl shadow-lg p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-blue-600">Bảng điều khiển bác sĩ</h1>
                                <p className="text-gray-600">Quản lý và theo dõi hoạt động</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <button className="p-3 bg-orange-500 text-white rounded-2xl">
                                        <span className="text-lg">🔔</span>
                                    </button>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {messages.filter(msg => msg.type === 'NOTIFICATION').length}
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-6 py-3 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition-all"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Welcome section */}
                                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl">
                                    <h3 className="text-3xl font-bold text-blue-600 mb-2">Chào mừng trở lại! 👋</h3>
                                    <p className="text-gray-600">Tổng quan về hoạt động hôm nay</p>
                                </div>

                                {/* Stats grid */}
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
                        
                        {activeTab === 'messages' && (
                            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl">
                                <h4 className="text-2xl font-bold mb-6">Tin nhắn</h4>
                                <div className="flex h-[500px]">
                                    {/* Chat list */}
                                    <div className="w-1/3 border-r pr-4">
                                        <h5 className="text-lg font-semibold mb-4">Danh sách trò chuyện</h5>
                                        {[...new Set(messages.map(msg => msg.sender !== userName ? msg.sender : msg.receiver))].map((user, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSelectChat(user)}
                                                className={`w-full text-left p-3 rounded-lg mb-2 transition-all ${
                                                    selectedChat === user ? 'bg-blue-100' : 'bg-gray-100'
                                                } hover:bg-blue-200`}
                                            >
                                                {user}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Chat area */}
                                    <div className="w-2/3 pl-4 flex flex-col">
                                        <h5 className="text-lg font-semibold mb-4">
                                            Trò chuyện với {selectedChat}
                                        </h5>
                                        <div className="flex-1 overflow-y-auto space-y-3">
                                            {messages
                                                .filter(msg => 
                                                    (msg.sender === selectedChat && msg.receiver === userName) || 
                                                    (msg.sender === userName && msg.receiver === selectedChat)
                                                )
                                                .map((msg, index) => (
                                                    <div key={index} className="flex justify-end">
                                                        <div className={`rounded-lg p-3 max-w-xs ${
                                                            msg.sender === userName 
                                                                ? 'bg-blue-500 text-white' 
                                                                : 'bg-green-500 text-white'
                                                        }`}>
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className="text-xs font-medium">
                                                                    {msg.sender === userName ? '👨‍⚕️ Bác sĩ' : '👤 Người dùng'}
                                                                </span>
                                                                <span className="text-xs opacity-70">
                                                                    {msg.sender}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm">{msg.content}</p>
                                                            <p className="text-xs mt-1 opacity-70">
                                                                {new Date(msg.sentAt).toLocaleTimeString('vi-VN')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            {fetchError && <p className="text-red-500 text-sm">{fetchError}</p>}
                                        </div>
                                        
                                        {/* Message input */}
                                        {selectedChat && (
                                            <form onSubmit={sendMessage} className="flex gap-3 mt-4">
                                                <input
                                                    type="text"
                                                    value={messageInput}
                                                    onChange={(e) => setMessageInput(e.target.value)}
                                                    placeholder="Nhập tin nhắn..."
                                                    className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!messageInput.trim()}
                                                    className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Gửi
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
>>>>>>> Stashed changes
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Tuần hoàn thành</h3>
              <p className="text-2xl font-bold text-blue-600">89</p>
              <p className="text-green-600">+15% so với tháng trước</p>
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
  );
};

export default DoctorDashboard;