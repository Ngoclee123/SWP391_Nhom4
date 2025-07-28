import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationService from '../service/NotificationService';
import userService from '../service/userService';
import '../styles/notificationsPage.css';

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
    <div className="notifications-page-container">
      <h1 className="page-title">Notifications</h1>
      
      {isAdmin && (
        <div className="admin-actions">
          <button className="action-button send-all" onClick={() => navigate('/admin-dashboard/send-notification')}>
            Send Notification
          </button>
        </div>
      )}

      {isDoctor && (
        <div className="doctor-actions">
          <button className="action-button send-to-patients" onClick={() => navigate('/doctor-dashboard/send-notification')}>
            Message Patients
          </button>
        </div>
      )}

      <div className="notifications-content">
        <div className="notifications-sidebar">
          <div className="sidebar-header">
            <h2>All Notifications</h2>
            {notifications.some(notification => !notification.isRead) && (
              <button className="mark-all-read-btn" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-notifications">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications-message">No notifications found</div>
          ) : (
            <>
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div 
                    key={notification.notificationId}
                    className={`notification-list-item ${!notification.isRead ? 'unread' : ''} ${selectedNotification?.notificationId === notification.notificationId ? 'selected' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-preview">
                      <h3 className="notification-preview-subject">{notification.subject}</h3>
                      <p className="notification-preview-time">{formatDate(notification.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-button" 
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button 
                    className="pagination-button"
                    disabled={currentPage === totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="notification-detail-panel">
          {selectedNotification ? (
            <div className="notification-detail">
              <div className="notification-detail-header">
                <h2>{selectedNotification.subject}</h2>
                <div className="notification-actions">
                  <button className="delete-button" onClick={() => deleteNotification(selectedNotification.notificationId)}>
                    Delete
                  </button>
                  <button className="close-button" onClick={handleCloseDetail}>
                    Close
                  </button>
                </div>
              </div>
              
              <div className="notification-metadata">
                <p>
                  <span className="metadata-label">From:</span> 
                  <span className="metadata-value">{selectedNotification.senderName || 'System'}</span>
                </p>
                <p>
                  <span className="metadata-label">Received:</span> 
                  <span className="metadata-value">{formatDate(selectedNotification.createdAt)}</span>
                </p>
                {selectedNotification.notificationType === 'VACCINE_APPOINTMENT' && (
                  <>
                    <p>
                      <span className="metadata-label">Patient:</span> 
                      <span className="metadata-value">{selectedNotification.patientName}</span>
                    </p>
                    <p>
                      <span className="metadata-label">Vaccine:</span> 
                      <span className="metadata-value">{selectedNotification.vaccineName}</span>
                    </p>
                    <p>
                      <span className="metadata-label">Appointment Date:</span> 
                      <span className="metadata-value">{selectedNotification.appointmentDate}</span>
                    </p>
                  </>
                )}
              </div>
              
              <div className="notification-detail-body">
                {selectedNotification.body}
              </div>
            </div>
          ) : (
            <div className="no-notification-selected">
              <p>Select a notification to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 