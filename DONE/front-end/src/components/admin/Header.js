import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserService from '../../service/userService';

const Header = React.memo(({ currentPageTitle, notificationCount, clearNotifications, adminName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    UserService.removeUser();
    navigate('/login');
  };

  // Lấy chữ cái đầu của tên để làm avatar
  const avatarLetter = adminName && adminName.trim().length > 0 ? adminName.trim()[0].toUpperCase() : 'A';

  return (
    <header className="bg-white shadow-sm px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{currentPageTitle}</h2>
          <p className="text-gray-600 mt-1">Chào mừng bạn quay trở lại hệ thống quản trị!</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={clearNotifications}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notificationCount}
                </span>
              )}
            </button>
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