import { useState, useEffect, useCallback } from 'react';
import NotificationService from '../../service/NotificationService';
import userService from '../../service/userService';

const useNotifications = () => {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    if (!userService.isLoggedIn()) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      const unreadCount = await NotificationService.getUnreadCount(accountId);
      setCount(unreadCount);
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userService.isLoggedIn()) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    setLoading(true);
    try {
      const data = await NotificationService.getUserNotifications(accountId);
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark all notifications as read
  const clearNotifications = useCallback(async () => {
    if (!userService.isLoggedIn()) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      await NotificationService.markAllAsRead(accountId);
      setCount(0);
      // Refresh notifications to reflect read status
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [fetchNotifications]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!userService.isLoggedIn()) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      await NotificationService.markAsRead(accountId, notificationId);
      // Refresh counts and notifications
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, [fetchUnreadCount, fetchNotifications]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    // Set up interval to check for new notifications every minute
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, fetchNotifications]);

  return { 
    count, 
    notifications, 
    loading, 
    clearNotifications, 
    markAsRead, 
    fetchNotifications 
  };
};

export default useNotifications;