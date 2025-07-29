<<<<<<< HEAD
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
=======
import React, { useState, useCallback } from 'react';
>>>>>>> ngocle_new
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardOverview from './DashboardOverview';
import AppointmentManagement from './AppointmentManagement';
import DoctorManagement from './DoctorManagement';
import { Settings } from 'lucide-react';
import useNotifications from './useNotifications';
import PatientManagement from './PatientManagement';
<<<<<<< HEAD
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
import SendNotification from './SendNotification';

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'accounts', label: 'Tài khoản' },
  { id: 'appointments', label: 'Lịch hẹn' },
  { id: 'appointment-stats', label: 'Thống kê lịch hẹn' },
  { id: 'doctors', label: 'Bác sĩ' },
  { id: 'patients', label: 'Bệnh nhân' },
  { id: 'patient-stats', label: 'Thống kê bệnh nhân' },
  { id: 'doctor-stats', label: 'Thống kê bác sĩ' },
  { id: 'feedbacks', label: 'Quản lý Feedback' },
  { id: 'notifications', label: 'Gửi thông báo' },
  { id: 'vaccine-management', label: 'Quản lý vaccine' },
  { id: 'vaccine-appointment-management', label: 'Lịch tiêm chủng' },
  { id: 'vaccine-statistics', label: 'Thống kê tiêm chủng' },
  { id: 'vaccine-availability-management', label: 'Quản lý lịch vaccine' }
=======

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'appointments', label: 'Lịch hẹn' },
  { id: 'doctors', label: 'Bác sĩ' },
  { id: 'patients', label: 'Bệnh nhân' },
  { id: 'consultations', label: 'Tư vấn' },
  { id: 'reports', label: 'Báo cáo' },
  { id: 'settings', label: 'Cài đặt' }
>>>>>>> ngocle_new
];

const AdminDashboards = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
<<<<<<< HEAD
  const { count, notifications, loading, clearNotifications, markAsRead } = useNotifications();
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
=======
  const { count: notificationCount, clearNotifications } = useNotifications();
>>>>>>> ngocle_new

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'dashboard':
<<<<<<< HEAD
        return <DashboardOverview setActiveTab={setActiveTab} />;
      case 'accounts':
        return <AccountManagement />;
=======
        return <DashboardOverview />;
>>>>>>> ngocle_new
      case 'appointments':
        return <AppointmentManagement />;
      case 'doctors':
        return <DoctorManagement />;
<<<<<<< HEAD
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

      case 'notifications':
        return <SendNotification />;

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

=======
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

>>>>>>> ngocle_new
  const currentPageTitle = NAVIGATION_ITEMS.find(item => item.id === activeTab)?.label || 'Tổng quan';

  return (
    <div className="min-h-screen bg-gray-50 flex">
<<<<<<< HEAD
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} navigationItems={NAVIGATION_ITEMS} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          currentPageTitle={currentPageTitle}
          notificationCount={count}
          clearNotifications={clearNotifications}
          adminName={adminName}
          notifications={notifications}
          loading={loading}
          markAsRead={markAsRead}
=======
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          currentPageTitle={currentPageTitle}
          notificationCount={notificationCount}
          clearNotifications={clearNotifications}
>>>>>>> ngocle_new
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboards;