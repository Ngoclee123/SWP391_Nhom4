import React from 'react';
import { Bell } from 'lucide-react';

const Header = React.memo(({ currentPageTitle, notificationCount, clearNotifications }) => (
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
            <span className="text-white font-bold">A</span>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">Admin User</p>
            <p className="text-gray-500">Quản trị viên hệ thống</p>
          </div>
        </div>
      </div>
    </div>
  </header>
));

export default Header;