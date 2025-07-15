import axiosClient from '../api/axiosClient';

class StatsService {
  // Lấy thống kê bác sĩ theo tháng
  async getDoctorStats(year, month) {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      
      const data = await axiosClient.get('/api/stats/doctors', { params });
      // Đảm bảo luôn trả về mảng, không undefined/null
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
      throw error;
    }
  }

  // Lấy thống kê tổng quan dashboard
  async getDashboardStats(year, month) {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      
      const data = await axiosClient.get('/api/stats/dashboard', { params });
      // Đảm bảo luôn trả về object, không undefined/null
      return data || {};
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}

export default new StatsService();
