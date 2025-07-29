import React, { useState, useEffect, useRef } from 'react';
import NotificationService from '../service/NotificationService';
import userService from '../service/userService';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/notificationBell.css';
import { Popover, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
dayjs.extend(relativeTime);

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const dropdownRef = useRef(null);
  const popoverRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUnreadCount = async () => {
    if (!userService.isLoggedIn() || isLoading) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    setIsLoading(true);
    try {
      const count = await NotificationService.getUnreadCount(accountId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị toast khi có thông báo mới
  const showToastNotification = (notification) => {
    toast.custom((t) => (
      <AnimatePresence>
        {t.visible && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className={`max-w-xs w-full bg-white dark:bg-gray-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            style={{ borderLeft: '4px solid #2563eb', padding: '16px', margin: '8px' }}
          >
            <div className="flex-1 w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{notification.subject}</p>
                <span className="ml-2 text-xs text-gray-400">Mới</span>
              </div>
              <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{notification.body}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ), { duration: 4000 });
  };

  const fetchNotifications = async () => {
    if (!userService.isLoggedIn()) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      const data = await NotificationService.getUserNotifications(accountId);
      
      // Chỉ hiển thị toast khi lần đầu load và có thông báo chưa đọc, và chưa hiển thị toast
      if (data.length > 0 && notifications.length === 0 && !hasShownInitialToast) {
        const unreadNotifications = data.filter(n => !n.isRead);
        if (unreadNotifications.length > 0) {
          showToastNotification(unreadNotifications[0]);
        }
        setHasShownInitialToast(true);
      }
      
      // Luôn cập nhật để đảm bảo đồng bộ khi có thay đổi (xóa, đánh dấu đọc)
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    // Reset toast state when user changes
    setHasShownInitialToast(false);
    fetchUnreadCount();
    fetchNotifications();
    
    // Polling for new notifications every 30 seconds (giảm tần suất)
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    // Listen for custom events to refresh notifications with debounce
    let updateTimeout;
    const handleNotificationUpdate = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        fetchUnreadCount();
        fetchNotifications();
      }, 500); // Debounce 500ms
    };

    window.addEventListener('notification-updated', handleNotificationUpdate);

    return () => {
      clearInterval(interval);
      clearTimeout(updateTimeout);
      window.removeEventListener('notification-updated', handleNotificationUpdate);
    };
  }, [userService.getAccountId()]); // Re-run when account ID changes (login/logout)

  // Đóng dropdown khi route thay đổi
  useEffect(() => {
    if (isPopoverOpen) {
      setIsPopoverOpen(false);
    }
  }, [location.pathname]);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    // Không cần fetch lại vì đã có polling tự động
  };

  const markAsRead = async (notificationId) => {
    if (!userService.isLoggedIn()) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      // Cập nhật state ngay lập tức để UX mượt mà
      setNotifications(prev => prev.map(notification => 
        notification.notificationId === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
      
      // Cập nhật unread count ngay lập tức
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Gọi API để cập nhật backend
      await NotificationService.markAsRead(accountId, notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Nếu lỗi, revert lại state
      setNotifications(prev => prev.map(notification => 
        notification.notificationId === notificationId 
          ? { ...notification, isRead: false } 
          : notification
      ));
      setUnreadCount(prev => prev + 1);
    }
  };

  const markAllAsRead = async () => {
    if (!userService.isLoggedIn()) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    const currentUnreadCount = unreadCount;
    
    try {
      // Cập nhật state ngay lập tức để UX mượt mà
      setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
      setUnreadCount(0);
      
      // Gọi API để cập nhật backend
      await NotificationService.markAllAsRead(accountId);
    } catch (error) {
      console.error("Error marking all as read:", error);
      // Nếu lỗi, revert lại state
      setNotifications(prev => prev.map(notification => ({ ...notification, isRead: false })));
      setUnreadCount(currentUnreadCount);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }

    // Navigation based on notification type
    if (notification.notificationType === 'VACCINE_APPOINTMENT' && notification.referenceId) {
      navigate(`/vaccine-appointments/admin/${notification.referenceId}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Popover className="relative" ref={popoverRef}>
      {({ open }) => {
        // Sync state with Popover state
        if (open !== isPopoverOpen) {
          setIsPopoverOpen(open);
        }
        return (
        <>
          <Popover.Button className="bell-icon focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full relative">
            <BellIcon className="w-7 h-7 text-blue-600" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-white">
                {unreadCount}
              </span>
            )}
          </Popover.Button>
          <Transition
            show={open}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-2"
          >
            <Popover.Panel static className="absolute right-0 z-20 mt-2 w-96 max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                {notifications.some(n => !n.isRead) && (
                  <button className="text-blue-600 text-xs font-medium hover:underline focus:outline-none" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-gray-100 dark:divide-gray-800">
                            {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
                ) : (
                  notifications.slice(0, 10).map(notification => (
                    <button
                      key={notification.notificationId}
                      className={`w-full text-left px-4 py-3 focus:outline-none transition ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-900'} hover:bg-blue-100 dark:hover:bg-blue-800/50`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {!notification.isRead ? (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                          ) : (
                            <span className="inline-block w-2 h-2 bg-gray-300 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{notification.subject}</h4>
                            <span className="text-xs text-gray-400 ml-2">{dayjs(notification.createdAt).fromNow()}</span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">{notification.body}</p>
                          {notification.notificationType === 'VACCINE_APPOINTMENT' && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>Patient: {notification.patientName}</span> | <span>Vaccine: {notification.vaccineName}</span> | <span>Date: {notification.appointmentDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
                             <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
                 <button 
                   className="text-blue-600 text-sm font-medium hover:underline focus:outline-none" 
                   onClick={() => navigate('/notifications')}
                 >
                   View All
                 </button>
               </div>
            </Popover.Panel>
          </Transition>
        </>
        );
      }}
    </Popover>
  );
};

export default NotificationBell; 