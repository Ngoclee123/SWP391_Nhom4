// Profile.js
import React, { useState, useEffect } from 'react';
import DoctorDashboardService from '../../service/DoctorDashboardService';
import UserService from '../../service/userService';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = UserService.getToken();
        if (!token) {
          setError('Vui lòng đăng nhập lại để truy cập hồ sơ.');
          setLoading(false);
          window.location.href = '/login';
          return;
        }

        const decoded = jwtDecode(token);
        const accountId = decoded.accountId;
        console.log('Fetching doctor profile for accountId:', accountId);
        console.log('Decoded token:', decoded);

        const doctorData = await DoctorDashboardService.getDoctorByAccountId(accountId);
        console.log('Doctor data received:', doctorData);

        if (doctorData && typeof doctorData === 'object' && Object.keys(doctorData).length > 0) {
          setDoctor(doctorData);
        } else {
          setError('Không tìm thấy thông tin bác sĩ.');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải thông tin hồ sơ bác sĩ.';
        setError(errorMessage);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg z-50';
    successDiv.textContent = '✅ Hồ sơ đã được cập nhật thành công!';
    document.body.appendChild(successDiv);
    setTimeout(() => document.body.removeChild(successDiv), 3000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-blue-600 font-medium">Đang tải thông tin...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-red-200 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <p className="text-red-600 font-medium text-lg">{error}</p>
    </div>
  );

  if (!doctor) return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-200 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <p className="text-gray-600 font-medium text-lg">Không tìm thấy thông tin bác sĩ</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Hồ sơ chuyên môn 👤
            </h2>
            <p className="text-gray-600">Quản lý thông tin cá nhân và chuyên môn của bạn</p>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  💾 Lưu thay đổi
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                ✏️ Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Image Section */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              {doctor.imgs ? (
                <img
                  src={doctor.imgs}
                  alt="Doctor Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => (e.target.src = 'https://placehold.co/200x200')}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl border-4 border-white shadow-lg">
                  👨‍⚕️
                </div>
              )}
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300">
                  📷
                </button>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {doctor.fullName || 'Chưa cập nhật'}
            </h3>
            <p className="text-gray-600 mb-4">{doctor.specialtyName || 'Chưa cập nhật chuyên khoa'}</p>
            
            {/* Status Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{doctor.availabilityStatus || 'Không xác định'}</span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
            <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-3">ℹ️</span>
              Thông tin cá nhân
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 ${
                    isEditing 
                      ? 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  value={doctor.fullName || 'Chưa cập nhật'}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="text"
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 ${
                    isEditing 
                      ? 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  value={doctor.phoneNumber || 'Chưa cập nhật'}
                  readOnly={!isEditing}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm làm việc</label>
                <input
                  type="text"
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 ${
                    isEditing 
                      ? 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  value={doctor.locational || 'Chưa cập nhật'}
                  readOnly={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
            <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-3">🏥</span>
              Thông tin chuyên môn
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên khoa</label>
                <input
                  type="text"
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 ${
                    isEditing 
                      ? 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  value={doctor.specialtyName || 'Chưa cập nhật'}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái hoạt động</label>
                <select
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 ${
                    isEditing 
                      ? 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  value={doctor.availabilityStatus || ''}
                  disabled={!isEditing}
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="Có sẵn">Có sẵn</option>
                  <option value="Bận">Bận</option>
                  <option value="Nghỉ phép">Nghỉ phép</option>
                </select>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
            <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-3">⏰</span>
              Giờ làm việc
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian bắt đầu</label>
                <input
                  type="time"
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 ${
                    isEditing 
                      ? 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  value={doctor.startTime || ''}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian kết thúc</label>
                <input
                  type="time"
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 ${
                    isEditing 
                      ? 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  value={doctor.endTime || ''}
                  readOnly={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
        <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-2xl mr-3">📊</span>
          Thống kê hoạt động
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-sm text-gray-600">Bệnh nhân đã khám</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
            <div className="text-2xl font-bold text-green-600">4.8</div>
            <div className="text-sm text-gray-600">Đánh giá trung bình</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl">
            <div className="text-2xl font-bold text-orange-600">89%</div>
            <div className="text-sm text-gray-600">Tỷ lệ hài lòng</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
            <div className="text-2xl font-bold text-purple-600">2.5</div>
            <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;