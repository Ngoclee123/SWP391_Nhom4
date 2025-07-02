import React from 'react';
import { Stethoscope, BarChart3, Calendar, Users, MessageSquare, FileText, Settings, Syringe, ClipboardList } from 'lucide-react';

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
  { id: 'accounts', label: 'Tài khoản', icon: Users },
  { id: 'appointments', label: 'Lịch hẹn', icon: Calendar },
  { id: 'doctors', label: 'Bác sĩ', icon: Stethoscope },
  { id: 'patients', label: 'Bệnh nhân', icon: Users },
  { id: 'consultations', label: 'Tư vấn', icon: MessageSquare },
  { id: 'reports', label: 'Báo cáo', icon: FileText },
  { id: 'vaccine-management', label: 'Vaccine', icon: Syringe },
  { id: 'vaccine-appointment-management', label: 'Lịch tiêm', icon: ClipboardList },
  { id: 'vaccine-statistics', label: 'Thống kê vaccine', icon: BarChart3 },
  { id: 'settings', label: 'Cài đặt', icon: Settings }
];

const Sidebar = React.memo(({ activeTab, setActiveTab }) => (
  <aside className="w-65 bg-white shadow-lg border-r border-gray-200">
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Stethoscope className="w-6 h-6 text-white" />
        </div> */}
        <img alt="Baby Health Hub Logo" className="w-20 h-20 object-contain rounded-full" src="/images/Logo.jpg" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">BabyHealthHub</h1>
          <p className="text-sm text-gray-500">Admin Dashboard</p>
        </div>
      </div>
    </div>

    <nav className="p-4">
      <ul className="space-y-2">
        {NAVIGATION_ITEMS.map((item) => {
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
));

export default Sidebar;