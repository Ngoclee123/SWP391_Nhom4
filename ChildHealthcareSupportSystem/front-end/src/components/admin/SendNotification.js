import React, { useState, useEffect } from 'react';
import NotificationService from '../../service/NotificationService';
import UserService from '../../service/userService';
import { CheckCircleIcon, XCircleIcon, Loader2Icon, SendIcon } from 'lucide-react';
import toast from 'react-hot-toast';

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
      toast.success('Thông báo đã được gửi thành công!');
      setSubject('');
      setMessage('');
      setRecipients('all');
      
      // Trigger event to update notifications in other components after a short delay
      setTimeout(() => {
        NotificationService.triggerNotificationUpdate();
      }, 1000);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Có lỗi xảy ra khi gửi thông báo. Vui lòng thử lại sau.');
      toast.error('Có lỗi xảy ra khi gửi thông báo!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-8 max-w-2xl mx-auto mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          Gửi thông báo
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gửi thông báo tới người dùng trong hệ thống
        </p>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Thông báo đã được gửi thành công!</span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          <XCircleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSendNotification} className="space-y-6">
        <div>
          <label htmlFor="recipients" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
            Người nhận
          </label>
          <select
            id="recipients"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="all">Tất cả người dùng</option>
            <option value="DOCTOR">Tất cả bác sĩ</option>
            <option value="USER">Tất cả bệnh nhân</option>
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
            Tiêu đề thông báo *
          </label>
          <input
            type="text"
            id="subject"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Nhập tiêu đề thông báo"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
            Nội dung thông báo *
          </label>
          <textarea
            id="message"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
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
            className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? <Loader2Icon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
            {loading ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendNotification; 