import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardOverview from './DashboardOverview';
import AppointmentManagement from './AppointmentManagement';
import DoctorManagement from './DoctorManagement';
import { Settings } from 'lucide-react';
import useNotifications from './useNotifications';
import PatientManagement from './PatientManagement';
import AccountManagement from './AccountManagement';
import UserService from '../../service/userService';
import VaccineManagement from "./VaccineManagement";
import VaccineAppointmentManagement from "./VaccineAppointmentManagement";
import VaccineStatistics from "./VaccineStatistics";
import VaccineAvailabilityManagement from "./VaccineAvailabilityManagement";
import PatientStatsDashboard from './PatientStatsDashboard ';
import DoctorStats from './DoctorStats';
import FeedbackManagement from './FeedbackManagement ';
import AppointmentStatsDashboard from './AppointmentStatsDashboard';

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'accounts', label: 'Tài khoản' },
  { id: 'appointments', label: 'Lịch hẹn' },
  { id: 'appointment-stats', label: 'Thống kê lịch hẹn' },
  { id: 'doctors', label: 'Bác sĩ' },
  { id: 'patients', label: 'Bệnh nhân' },
  { id: 'patient-stats', label: 'Thống kê bệnh nhân' },
  { id: 'doctor-stats', label: 'Thống kê bác sĩ' }
];

const AdminDashboards = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { count: notificationCount, clearNotifications } = useNotifications();
  const navigate = useNavigate();

  // Lấy tên người dùng từ localStorage
  const [adminName, setAdminName] = useState('');
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (!UserService.isLoggedIn() || UserService.getRole().toUpperCase() !== 'ADMIN') {
      navigate('/login', { replace: true });
    } else {
      setAdminName(UserService.getFullName() || UserService.getUsername() || 'Admin');
      setIsAuthChecked(true);
    }
  }, [navigate]);

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview setActiveTab={setActiveTab} />;
      case 'accounts':
        return <AccountManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'doctors':
        return <DoctorManagement />;
      case 'patients':
        return <PatientManagement />;
        case 'patient-stats':
          // return <PatientStatsDashboard />;
        case 'doctor-stats':
          return <DoctorStats />;
        case 'feedbacks':
          return <FeedbackManagement />;
          
      case 'appointment-stats':
        return <AppointmentStatsDashboard />;

      // case 'consultations':
      // case 'reports':
      // case 'settings':
      //   return (
      //     <div className="flex flex-col items-center justify-center py-24 text-center">
      //       <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      //         <Settings className="w-8 h-8 text-gray-400" />
      //       </div>
      //       <h3 className="text-xl font-semibold text-gray-900 mb-2">
      //         Chức năng đang phát triển
      //       </h3>
      //       <p className="text-gray-600 max-w-md">
      //         Tính năng {NAVIGATION_ITEMS.find(item => item.id === activeTab)?.label.toLowerCase()} 
      //         đang được phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo.
      //       </p>
      //     </div>
      //   );
      case 'vaccine-management':
        return <VaccineManagement />;
      case 'vaccine-appointment-management':
        return <VaccineAppointmentManagement />;
      case 'vaccine-statistics':
        return <VaccineStatistics />;
      case 'vaccine-availability-management':
        return <VaccineAvailabilityManagement />;
      default:
        return <DashboardOverview setActiveTab={setActiveTab} />;
    }
  }, [activeTab]);

  if (!isAuthChecked) {
    // Chưa xác thực xong, không render gì cả (tránh nháy trang)
    return null;
  }

  const currentPageTitle = NAVIGATION_ITEMS.find(item => item.id === activeTab)?.label || 'Tổng quan';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          currentPageTitle={currentPageTitle}
          notificationCount={notificationCount}
          clearNotifications={clearNotifications}
          adminName={adminName}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboards;