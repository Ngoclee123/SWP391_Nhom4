import React, { useState, useEffect, useRef } from 'react';
import NotificationService from '../service/NotificationService';
import userService from '../service/userService';
import { useNavigate } from 'react-router-dom';
import '../styles/notificationBell.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    if (!userService.isLoggedIn()) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      const count = await NotificationService.getUnreadCount(accountId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const fetchNotifications = async () => {
    if (!userService.isLoggedIn()) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    setIsLoading(true);
    try {
      const data = await NotificationService.getUserNotifications(accountId);
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Polling for new notifications every minute
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isOpen]);

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
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId) => {
    if (!userService.isLoggedIn()) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      await NotificationService.markAsRead(accountId, notificationId);
      setNotifications(notifications.map(notification => 
        notification.notificationId === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!userService.isLoggedIn()) return;

    const accountId = userService.getAccountId();
    if (!accountId) return;

    try {
      await NotificationService.markAllAsRead(accountId);
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
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
    <div className="notification-bell-container" ref={dropdownRef}>
      <div className="bell-icon" onClick={toggleDropdown}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3 className="notifications-title">Notifications</h3>
            {notifications.some(notification => !notification.isRead) && (
              <button className="mark-all-read" onClick={markAllAsRead}>Mark all as read</button>
            )}
          </div>

          <div className="notifications-list">
            {isLoading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.notificationId}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <h4 className="notification-subject">{notification.subject}</h4>
                    <p className="notification-body">{notification.body}</p>
                    {notification.notificationType === 'VACCINE_APPOINTMENT' && (
                      <div className="notification-details">
                        <p>Patient: {notification.patientName}</p>
                        <p>Vaccine: {notification.vaccineName}</p>
                        <p>Date: {notification.appointmentDate}</p>
                      </div>
                    )}
                    <span className="notification-time">{formatDate(notification.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notifications-footer">
            <button className="view-all" onClick={() => navigate('/notifications')}>View All</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 