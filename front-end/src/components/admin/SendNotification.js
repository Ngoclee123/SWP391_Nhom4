import React, { useState, useEffect } from 'react';
import NotificationService from '../../service/NotificationService';
import UserService from '../../service/userService';
import { AlertCircle, Send, CheckCircle } from 'lucide-react';

const SendNotification = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('all'); // 'all', 'doctors', 'patients'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung thông báo');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const adminId = UserService.getAccountId();
      if (!adminId) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      console.log("Sending notification with:", {
        adminId,
        recipients,
        subject,
        message,
        userRole: UserService.getRole()
      });

      if (recipients === 'all') {
        await NotificationService.sendNotificationToAll(adminId, subject, message);
      } else {
        await NotificationService.sendNotificationToRole(adminId, recipients, subject, message);
      }

      setSuccess(true);
      setSubject('');
      setMessage('');
      setRecipients('all');
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Có lỗi xảy ra khi gửi thông báo. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gửi thông báo</h2>
        <p className="text-gray-600 mt-1">
          Gửi thông báo tới người dùng trong hệ thống
        </p>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>Thông báo đã được gửi thành công!</span>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSendNotification}>
        <div className="mb-4">
          <label htmlFor="recipients" className="block text-gray-700 font-medium mb-2">
            Người nhận
          </label>
          <select
            id="recipients"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
          >
            <option value="all">Tất cả người dùng</option>
            <option value="DOCTOR">Bác sĩ</option>
            <option value="USER">Bệnh nhân/Phụ huynh</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
            Tiêu đề thông báo *
          </label>
          <input
            type="text"
            id="subject"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tiêu đề thông báo"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
            Nội dung thông báo *
          </label>
          <textarea
            id="message"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập nội dung thông báo"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`
              flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}
            `}
            disabled={loading}
          >
            <Send className="w-5 h-5 mr-2" />
            {loading ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendNotification; 