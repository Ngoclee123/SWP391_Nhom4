import axiosClient from '../api/axiosClient';

class StatsService {
  // Lấy thống kê bác sĩ theo tháng
  async getDoctorStats(year, month) {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      
      const response = await axiosClient.get('/api/stats/doctors', { params });
      // Đảm bảo luôn trả về mảng, không undefined/null
      return Array.isArray(response.data) ? response.data : [];
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
      
      const response = await axiosClient.get('/api/stats/dashboard', { params });
      // Đảm bảo luôn trả về object, không undefined/null
      return response.data || {};
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}

export default new StatsService();
