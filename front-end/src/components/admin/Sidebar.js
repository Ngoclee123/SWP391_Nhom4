import React, { useState, useEffect } from 'react';
import {
  Stethoscope, BarChart3, Calendar, Users, MessageSquare, FileText,
  Settings, Syringe, ClipboardList, TrendingUp, Bell, ChevronDown, ChevronRight
} from 'lucide-react';

// Cấu trúc menu mới với dropdown
const MENU_STRUCTURE = [
  { id: 'dashboard', label: 'Tổng quan', icon: BarChart3, type: 'single' },
  { 
    id: 'appointments', 
    label: 'Lịch hẹn', 
    icon: Calendar, 
    type: 'dropdown',
    children: [
      { id: 'appointments', label: 'Quản lý lịch hẹn', icon: Calendar },
      { id: 'appointment-stats', label: 'Thống kê lịch hẹn', icon: TrendingUp }
    ]
  },
  { 
    id: 'doctors', 
    label: 'Bác sĩ', 
    icon: Stethoscope, 
    type: 'dropdown',
    children: [
      { id: 'doctors', label: 'Quản lý bác sĩ', icon: Stethoscope },
      { id: 'doctor-stats', label: 'Thống kê bác sĩ', icon: TrendingUp }
    ]
  },
  { id: 'patients', label: 'Bệnh nhân', icon: Users, type: 'single' },
  { id: 'accounts', label: 'Tài khoản', icon: Users, type: 'single' },
  { id: 'feedbacks', label: 'Quản lý Feedback', icon: MessageSquare, type: 'single' },
  { id: 'notifications', label: 'Gửi thông báo', icon: Bell, type: 'single' },
  { 
    id: 'vaccine', 
    label: 'Vaccine', 
    icon: Syringe, 
    type: 'dropdown',
    children: [
      { id: 'vaccine-management', label: 'Quản lý vaccine', icon: Syringe },
      { id: 'vaccine-appointment-management', label: 'Lịch tiêm chủng', icon: ClipboardList },
      { id: 'vaccine-statistics', label: 'Thống kê vaccine', icon: BarChart3 },
      { id: 'vaccine-availability-management', label: 'Quản lý lịch vaccine', icon: ClipboardList }
    ]
  }
];

const Sidebar = React.memo(({ activeTab, setActiveTab }) => {
  const [expandedMenus, setExpandedMenus] = useState(new Set());

  // Tự động mở dropdown khi activeTab thay đổi
  useEffect(() => {
    const newExpanded = new Set();
    MENU_STRUCTURE.forEach(menu => {
      if (menu.type === 'dropdown' && menu.children.some(child => child.id === activeTab)) {
        newExpanded.add(menu.id);
      }
    });
    setExpandedMenus(newExpanded);
  }, [activeTab]);

  const toggleMenu = (menuId) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const handleMenuClick = (item) => {
    if (item.type === 'dropdown') {
      toggleMenu(item.id);
    } else {
      setActiveTab(item.id);
    }
  };

  const handleSubMenuClick = (subItem) => {
    setActiveTab(subItem.id);
  };

  const isMenuActive = (menu) => {
    if (menu.type === 'single') {
      return activeTab === menu.id;
    } else if (menu.type === 'dropdown') {
      return menu.children.some(child => child.id === activeTab);
    }
    return false;
  };

  const isSubMenuActive = (subItem) => {
    return activeTab === subItem.id;
  };

  return (
    <aside className="w-72 bg-white shadow-xl border-r border-gray-100">
      {/* Header */}
      <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <img alt="Baby Health Hub Logo" className="w-8 h-8 object-contain" src="/images/Logo.jpg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">BabyHealthHub</h1>
            <p className="text-sm text-gray-600 font-medium">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-6">
        <div className="space-y-3">
          {MENU_STRUCTURE.map((menu) => {
            const IconComponent = menu.icon;
            const isActive = isMenuActive(menu);
            const isExpanded = expandedMenus.has(menu.id);

            return (
              <div key={menu.id}>
                {menu.type === 'single' ? (
                  // Menu đơn lẻ
                  <button
                    onClick={() => handleMenuClick(menu)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all duration-200 font-medium group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                      }`} />
                    </div>
                    <span className="font-semibold">{menu.label}</span>
                  </button>
                ) : (
                  // Menu dropdown
                  <div>
                    <button
                      onClick={() => handleMenuClick(menu)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 font-medium group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 group-hover:bg-blue-100'
                        }`}>
                          <IconComponent className={`w-5 h-5 ${
                            isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                          }`} />
                        </div>
                        <span className="font-semibold">{menu.label}</span>
                      </div>
                      <div className={`transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}>
                        <ChevronDown className={`w-4 h-4 ${
                          isActive ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                      </div>
                    </button>
                    
                    {/* Submenu */}
                    {isExpanded && (
                      <div className="mt-2 ml-6 space-y-1">
                        {menu.children.map((subItem) => {
                          const SubIconComponent = subItem.icon;
                          const isSubActive = isSubMenuActive(subItem);
                          
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => handleSubMenuClick(subItem)}
                              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 text-sm font-medium group ${
                                isSubActive
                                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <div className={`p-1.5 rounded-md transition-all duration-200 ${
                                isSubActive 
                                  ? 'bg-blue-200' 
                                  : 'bg-gray-100 group-hover:bg-blue-100'
                              }`}>
                                <SubIconComponent className={`w-4 h-4 ${
                                  isSubActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                                }`} />
                              </div>
                              <span className="font-medium">{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
});

export default Sidebar;