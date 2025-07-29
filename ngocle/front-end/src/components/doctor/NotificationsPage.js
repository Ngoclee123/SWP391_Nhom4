import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../service/userService';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TrashIcon, CheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../api/axiosClient';
dayjs.extend(relativeTime);

const NotificationsPage = () => {
  console.log('Doctor NotificationsPage component rendered');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const handleUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener('notification-updated', handleUpdate);
    return () => window.removeEventListener('notification-updated', handleUpdate);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axiosClient.get('/api/notifications/doctor');
      // Đảm bảo notifications luôn là array
      const data = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
      setNotifications(data);
    } catch (error) {
      setNotifications([]); // Đảm bảo luôn là array khi lỗi
      toast.error('Lỗi khi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      // Optimistic update
      setNotifications(prev => prev.map(notification => 
        notification.notificationId === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));

      const response = await axiosClient.post(`/api/notifications/${accountId}/${notificationId}/read`);

      toast.success('Đã đánh dấu đã đọc');
      
      // Trigger notification update event
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Lỗi khi đánh dấu đã đọc');
      
      // Revert optimistic update
      setNotifications(prev => prev.map(notification => 
        notification.notificationId === notificationId 
          ? { ...notification, isRead: false } 
          : notification
      ));
    }
  };

  const markAllAsRead = async () => {
    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      // Optimistic update
      setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));

      const response = await axiosClient.post(`/api/notifications/${accountId}/read-all`);

      toast.success('Đã đánh dấu tất cả đã đọc');
      
      // Trigger notification update event
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Lỗi khi đánh dấu tất cả đã đọc');
      
      // Revert optimistic update
      fetchNotifications();
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await axiosClient.delete(`/api/notifications/${notificationId}`);

      setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
      setShowDeleteModal(false);
      setSelectedNotification(null);
      toast.success('Đã xóa thông báo');
      
      // Trigger notification update event
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Lỗi khi xóa thông báo');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }
    setSelectedNotification(notification);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'ADMIN_TO_DOCTOR':
        return 'Từ Admin';
      case 'VACCINE_APPOINTMENT':
        return 'Lịch hẹn Vaccine';
      case 'SYSTEM':
        return 'Hệ thống';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Thông báo của Bác sĩ
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Quản lý và xem tất cả thông báo của bạn
                </p>
              </div>
              <div className="flex space-x-3">
                {notifications && Array.isArray(notifications) && notifications.some(n => !n.isRead) && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
                <button
                  onClick={() => navigate('/doctor-dashboard')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications && Array.isArray(notifications) && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔔</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Không có thông báo nào
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Bạn sẽ thấy thông báo mới ở đây khi có cập nhật
                </p>
              </div>
            ) : (
              notifications && Array.isArray(notifications) && notifications.map(notification => (
                <div
                  key={notification.notificationId}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          !notification.isRead ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {getNotificationTypeLabel(notification.notificationType)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dayjs(notification.createdAt).fromNow()}
                        </span>
                      </div>
                      
                      <h3 className={`text-lg font-semibold mb-2 ${
                        !notification.isRead 
                          ? 'text-gray-900 dark:text-gray-100' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.subject}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                        {notification.body}
                      </p>
                      
                      {notification.senderName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <span className="font-medium">Từ:</span> {notification.senderName}
                        </p>
                      )}
                      
                      {notification.notificationType === 'VACCINE_APPOINTMENT' && (
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div><span className="font-medium">Bệnh nhân:</span> {notification.patientName}</div>
                            <div><span className="font-medium">Vaccine:</span> {notification.vaccineName}</div>
                            <div><span className="font-medium">Ngày hẹn:</span> {notification.appointmentDate}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.notificationId);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Đánh dấu đã đọc"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNotification(notification);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Xóa thông báo"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bạn có chắc chắn muốn xóa thông báo "{selectedNotification.subject}" không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedNotification(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => deleteNotification(selectedNotification.notificationId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;