import React from 'react';
import {
  Stethoscope, BarChart3, Calendar, Users, MessageSquare, FileText,
  Settings, Syringe, ClipboardList, TrendingUp, Bell
} from 'lucide-react';

// Default navigation items with icons (used if navigationItems not provided)
const DEFAULT_NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
  { id: 'accounts', label: 'Tài khoản', icon: Users },
  { id: 'appointments', label: 'Lịch hẹn', icon: Calendar },
  { id: 'appointment-stats', label: 'Thống kê lịch hẹn', icon: TrendingUp },
  { id: 'doctors', label: 'Bác sĩ', icon: Stethoscope },
  { id: 'patients', label: 'Bệnh nhân', icon: Users },
  // { id: 'patient-stats', label: 'Thống kê bệnh nhân', icon: TrendingUp },
  { id: 'doctor-stats', label: 'Thống kê bác sĩ', icon: TrendingUp },
  { id: 'feedbacks', label: 'Quản lý Feedback', icon: MessageSquare },
  { id: 'notifications', label: 'Gửi thông báo', icon: Bell },
  { id: 'vaccine-management', label: 'Vaccine', icon: Syringe },
  { id: 'vaccine-appointment-management', label: 'Lịch tiêm', icon: ClipboardList },
  { id: 'vaccine-statistics', label: 'Thống kê vaccine', icon: BarChart3 },
  { id: 'vaccine-availability-management', label: 'Quản lý lịch vaccine', icon: ClipboardList },
];

const Sidebar = React.memo(({ activeTab, setActiveTab, navigationItems = DEFAULT_NAV_ITEMS }) => {
  // Map icon components to navigation items if not already set
  const navItemsWithIcons = navigationItems.map(item => {
    if (item.icon) return item; // Already has icon

    // Assign icon based on ID
    let icon;
    switch (item.id) {
      case 'dashboard': icon = BarChart3; break;
      case 'accounts': icon = Users; break;
      case 'appointments': icon = Calendar; break;
      case 'appointment-stats': icon = TrendingUp; break;
      case 'doctors': icon = Stethoscope; break;
      case 'patients': icon = Users; break;
      case 'patient-stats': icon = TrendingUp; break;
      case 'doctor-stats': icon = TrendingUp; break;
      case 'notifications': icon = Bell; break;
      case 'vaccine-management': icon = Syringe; break;
      case 'vaccine-appointment-management': icon = ClipboardList; break;
      case 'vaccine-statistics': icon = BarChart3; break;
      case 'vaccine-availability-management': icon = ClipboardList; break;
      default: icon = FileText; // Default icon
    }

    return { ...item, icon };
  });

  return (
    <aside className="w-65 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img alt="Baby Health Hub Logo" className="w-20 h-20 object-contain rounded-full" src="/images/Logo.jpg" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">BabyHealthHub</h1>
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navItemsWithIcons.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
});

export default Sidebar;