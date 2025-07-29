import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationService from '../service/NotificationService';
import userService from '../service/userService';
import '../styles/notificationsPage.css';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async (page = 0) => {
    if (!userService.isLoggedIn()) {
      navigate('/login');
      return;
    }

    const accountId = userService.getAccountId();
    if (!accountId) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await NotificationService.getUserNotificationsPaginated(accountId, page, 10);
      setNotifications(response.content || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.number || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [navigate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchNotifications(newPage);
    }
  };

  const markAsRead = async (notificationId) => {
    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      await NotificationService.markAsRead(accountId, notificationId);
      setNotifications(notifications.map(notification => 
        notification.notificationId === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
      
      // Trigger event to update notification bell
      NotificationService.triggerNotificationUpdate();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      await NotificationService.markAllAsRead(accountId);
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      
      // Trigger event to update notification bell
      NotificationService.triggerNotificationUpdate();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.notificationId !== notificationId));
      
      if (selectedNotification?.notificationId === notificationId) {
        setSelectedNotification(null);
      }
      
      // Trigger event to update notification bell
      NotificationService.triggerNotificationUpdate();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }
  };

  const handleCloseDetail = () => {
    setSelectedNotification(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isAdmin = userService.getRole() === 'ADMIN';
  const isDoctor = userService.getRole() === 'DOCTOR';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-8 px-2 md:px-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/70">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">All Notifications</h2>
            {notifications.some(notification => !notification.isRead) && (
              <button className="text-blue-600 text-xs font-medium hover:underline focus:outline-none" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">No notifications found</div>
            ) : (
              notifications.map(notification => (
                <button
                    key={notification.notificationId}
                  className={`w-full text-left px-6 py-4 focus:outline-none transition flex items-center gap-3 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-transparent'} ${selectedNotification?.notificationId === notification.notificationId ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                  <span className={`inline-block w-2 h-2 rounded-full ${!notification.isRead ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{notification.subject}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dayjs(notification.createdAt).fromNow()}</p>
                  </div>
                </button>
              ))
            )}
              </div>
              {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/70">
                  <button 
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium disabled:opacity-50"
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button 
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium disabled:opacity-50"
                    disabled={currentPage === totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
          )}
        </div>
        <div className="w-full md:w-2/3 flex flex-col">
          {selectedNotification ? (
            <div className="flex-1 flex flex-col p-8">
              <div className="flex items-center justify-between mb-4">
                <button className="flex items-center gap-1 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={handleCloseDetail}>
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Back</span>
                  </button>
                <button className="flex items-center gap-1 text-red-500 hover:text-red-700 dark:hover:text-red-400" onClick={() => deleteNotification(selectedNotification.notificationId)}>
                  <TrashIcon className="w-5 h-5" />
                  <span>Delete</span>
                  </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedNotification.subject}</h2>
              <div className="flex items-center gap-3 mb-4 text-sm text-gray-500 dark:text-gray-400">
                <span>From: <span className="font-medium text-gray-700 dark:text-gray-200">{selectedNotification.senderName || 'System'}</span></span>
                <span>•</span>
                <span>{dayjs(selectedNotification.createdAt).fromNow()}</span>
              </div>
              {selectedNotification.notificationType === 'VACCINE_APPOINTMENT' && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="block">Patient: <span className="font-medium">{selectedNotification.patientName}</span></span>
                  <span className="block">Vaccine: <span className="font-medium">{selectedNotification.vaccineName}</span></span>
                  <span className="block">Appointment Date: <span className="font-medium">{selectedNotification.appointmentDate}</span></span>
                </div>
              )}
              <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-100">
                {selectedNotification.body}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ArrowLeftIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-lg text-gray-500 dark:text-gray-400">Select a notification to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 