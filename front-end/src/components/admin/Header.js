import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
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
    <header className="bg-white shadow-sm px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{currentPageTitle}</h2>
          <p className="text-gray-600 mt-1">Chào mừng bạn quay trở lại hệ thống quản trị!</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={handleNotificationClick}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-700">Thông báo</h3>
                  <div className="flex space-x-2">
                    {notificationCount > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-72 overflow-y-auto">
                  {loading ? (
                    <div className="py-8 text-center text-gray-500">Đang tải thông báo...</div>
                  ) : notifications && notifications.length > 0 ? (
                    <div>
                      {notifications.map(notification => (
                        <div 
                          key={notification.notificationId} 
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                          onClick={() => handleNotificationItemClick(notification)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900 text-sm">{notification.subject}</h4>
                            {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.body}</p>
                          {notification.notificationType === 'VACCINE_APPOINTMENT' && (
                            <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                              <div><span className="font-medium">Bệnh nhân:</span> {notification.patientName}</div>
                              <div><span className="font-medium">Vaccine:</span> {notification.vaccineName}</div>
                              <div><span className="font-medium">Ngày hẹn:</span> {notification.appointmentDate}</div>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">Không có thông báo nào</div>
                  )}
                </div>
                
                <div className="px-4 py-3 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      setActiveTab('notifications');
                      setShowNotifications(false);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
                  >
                    Gửi thông báo mới
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{avatarLetter}</span>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{adminName || 'Admin'}</p>
              <p className="text-gray-500">Quản trị viên hệ thống</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;