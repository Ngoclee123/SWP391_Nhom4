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
import DoctorStats from './DoctorStats';
import FeedbackManagement from './FeedbackManagement ';
import AppointmentStatsDashboard from './AppointmentStatsDashboard';
import SendNotification from './SendNotification';

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
      case 'appointment-stats':
        return <AppointmentStatsDashboard />;
      case 'doctors':
        return <DoctorManagement />;
      case 'doctor-stats':
        return <DoctorStats />;
      case 'patients':
        return <PatientManagement />;
      case 'feedbacks':
        return <FeedbackManagement />;
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

  // Hàm để lấy title của trang hiện tại
  const getCurrentPageTitle = () => {
    const menuStructure = [
      { id: 'dashboard', label: 'Tổng quan' },
      { id: 'accounts', label: 'Tài khoản' },
      { id: 'appointments', label: 'Quản lý lịch hẹn' },
      { id: 'appointment-stats', label: 'Thống kê lịch hẹn' },
      { id: 'doctors', label: 'Quản lý bác sĩ' },
      { id: 'doctor-stats', label: 'Thống kê bác sĩ' },
      { id: 'patients', label: 'Quản lý bệnh nhân' },
      { id: 'feedbacks', label: 'Quản lý Feedback' },
      { id: 'notifications', label: 'Gửi thông báo' },
      { id: 'vaccine-management', label: 'Quản lý vaccine' },
      { id: 'vaccine-appointment-management', label: 'Lịch tiêm chủng' },
      { id: 'vaccine-statistics', label: 'Thống kê vaccine' },
      { id: 'vaccine-availability-management', label: 'Quản lý lịch vaccine' }
    ];
    
    const currentItem = menuStructure.find(item => item.id === activeTab);
    return currentItem ? currentItem.label : 'Tổng quan';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            currentPageTitle={getCurrentPageTitle()}
            notificationCount={count}
            clearNotifications={clearNotifications}
            adminName={adminName}
            notifications={notifications}
            loading={loading}
            markAsRead={markAsRead}
            setActiveTab={setActiveTab}
          />
          <main className="flex-1 p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboards;