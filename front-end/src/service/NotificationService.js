import axiosClient from "../api/axiosClient";

const NotificationService = {
  // Get user notifications
  getUserNotifications: async (accountId) => {
    try {
      const response = await axiosClient.get(`/api/notifications/${accountId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // Get paginated user notifications
  getUserNotificationsPaginated: async (accountId, page = 0, size = 10) => {
    try {
      const response = await axiosClient.get(`/api/notifications/${accountId}/paginated?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching paginated notifications:", error);
      throw error;
    }
  },

  // Get unread notifications count
  getUnreadCount: async (accountId) => {
    try {
      const response = await axiosClient.get(`/api/notifications/${accountId}/unread/count`);
      return response.data.count || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },

  // Mark notification as read
  markAsRead: async (accountId, notificationId) => {
    try {
      await axiosClient.post(`/api/notifications/${accountId}/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (accountId) => {
    try {
      await axiosClient.post(`/api/notifications/${accountId}/read-all`);
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  },

  // Send notification to a user (doctor to patient or admin to any user)
  sendNotification: async (senderAccountId, receiverAccountId, subject, body, type = "GENERAL", referenceId = null) => {
    try {
      const params = new URLSearchParams();
      params.append('senderAccountId', senderAccountId);
      params.append('receiverAccountId', receiverAccountId);
      params.append('subject', subject);
      params.append('body', body);
      params.append('notificationType', type);
      
      if (referenceId) {
        params.append('referenceId', referenceId);
      }
      
      const response = await axiosClient.post('/api/notifications/send', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  },

  // Admin send notification to all users
  sendNotificationToAll: async (adminAccountId, subject, body) => {
    try {
      const params = new URLSearchParams();
      params.append('adminAccountId', adminAccountId);
      params.append('subject', subject);
      params.append('body', body);
      
      console.log('Sending notification to all with params:', {
        adminAccountId, subject, body
      });
      
      const response = await axiosClient.post('/api/notifications/send-all', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error sending notification to all:", error);
      throw error;
    }
  },

  // Send notification to users with specific role
  sendNotificationToRole: async (senderAccountId, role, subject, body) => {
    try {
      const params = new URLSearchParams();
      params.append('senderAccountId', senderAccountId);
      params.append('role', role);
      params.append('subject', subject);
      params.append('body', body);
      
      console.log('Sending notification to role with params:', {
        senderAccountId, role, subject, body
      });
      
      const response = await axiosClient.post('/api/notifications/send-role', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error sending notification to role:", error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      await axiosClient.delete(`/api/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }
};

export default NotificationService; 