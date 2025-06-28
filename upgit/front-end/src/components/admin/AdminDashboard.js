import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardOverview from './DashboardOverview';
import AppointmentManagement from './AppointmentManagement';
import DoctorManagement from './DoctorManagement';
import { Settings } from 'lucide-react';
import useNotifications from './useNotifications';
import PatientManagement from './PatientManagement';
import AccountManagement from './AccountManagement';

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'accounts', label: 'Tài khoản' },
  { id: 'appointments', label: 'Lịch hẹn' },
  { id: 'doctors', label: 'Bác sĩ' },
  { id: 'patients', label: 'Bệnh nhân' },
  { id: 'consultations', label: 'Tư vấn' },
  { id: 'reports', label: 'Báo cáo' },
  { id: 'settings', label: 'Cài đặt' }
];

const AdminDashboards = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { count: notificationCount, clearNotifications } = useNotifications();

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'accounts':
        return <AccountManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'doctors':
        return <DoctorManagement />;
      case 'patients':
        return <PatientManagement />;
      case 'consultations':
      case 'reports':
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chức năng đang phát triển
            </h3>
            <p className="text-gray-600 max-w-md">
              Tính năng {NAVIGATION_ITEMS.find(item => item.id === activeTab)?.label.toLowerCase()} 
              đang được phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo.
            </p>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  }, [activeTab]);

  const currentPageTitle = NAVIGATION_ITEMS.find(item => item.id === activeTab)?.label || 'Tổng quan';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          currentPageTitle={currentPageTitle}
          notificationCount={notificationCount}
          clearNotifications={clearNotifications}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboards;