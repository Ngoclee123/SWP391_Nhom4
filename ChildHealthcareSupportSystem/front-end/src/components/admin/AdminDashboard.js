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
];

const AdminDashboards = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const currentPageTitle = NAVIGATION_ITEMS.find(item => item.id === activeTab)?.label || 'Tổng quan';

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
          setActiveTab={setActiveTab}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboards;