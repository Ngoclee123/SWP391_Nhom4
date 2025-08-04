import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserService from '../../service/userService';

const Header = React.memo(({ currentPageTitle, notificationCount, clearNotifications, adminName, notifications, loading, markAsRead, setActiveTab }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    UserService.removeUser();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationItemClick = (notification) => {
    markAsRead(notification.notificationId);
    
    // Handle navigation based on notification type
    if (notification.notificationType === 'VACCINE_APPOINTMENT' && notification.referenceId) {
      navigate(`/admin-dashboard/vaccine-appointment-management/${notification.referenceId}`);
    }
  };

  const handleClickOutside = (event) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format date for notification display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get first letter of name for avatar
  const avatarLetter = adminName && adminName.trim().length > 0 ? adminName.trim()[0].toUpperCase() : 'A';

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Page Title */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{currentPageTitle}</h1>
            <p className="text-gray-600 font-medium">Chào mừng bạn quay trở lại hệ thống quản trị</p>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={handleNotificationClick}
                className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
              >
                <Bell className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg">Thông báo</h3>
                    <div className="flex items-center space-x-3">
                      {notificationCount > 0 && (
                        <button 
                          onClick={clearNotifications}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                      <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                        <p className="text-gray-500 font-medium">Đang tải thông báo...</p>
                      </div>
                    ) : notifications && notifications.length > 0 ? (
                      <div>
                        {notifications.map(notification => (
                          <div 
                            key={notification.notificationId} 
                            className={`px-6 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                              !notification.isRead ? 'bg-blue-50/50' : ''
                            }`}
                            onClick={() => handleNotificationItemClick(notification)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-800 text-sm leading-tight">{notification.subject}</h4>
                              {!notification.isRead && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{notification.body}</p>
                            {notification.notificationType === 'VACCINE_APPOINTMENT' && (
                              <div className="mb-2 p-3 bg-gray-50 rounded-lg text-xs">
                                <div className="grid grid-cols-1 gap-1">
                                  <div><span className="font-semibold text-gray-700">Bệnh nhân:</span> {notification.patientName}</div>
                                  <div><span className="font-semibold text-gray-700">Vaccine:</span> {notification.vaccineName}</div>
                                  <div><span className="font-semibold text-gray-700">Ngày hẹn:</span> {notification.appointmentDate}</div>
                                </div>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 font-medium">{formatDate(notification.createdAt)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Không có thông báo nào</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotifications(false);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Gửi thông báo mới
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-4 pl-6 border-l border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-sm">{adminName || 'Admin'}</p>
                  <p className="text-gray-500 text-xs font-medium">Quản trị viên</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;