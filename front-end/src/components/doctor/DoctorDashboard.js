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
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Lịch hẹn hôm nay</h3>
              <p className="text-2xl font-bold text-blue-600">45</p>
              <p className="text-green-600">+8% so với tháng trước</p>
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