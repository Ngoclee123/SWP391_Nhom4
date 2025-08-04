import axiosClient from "../api/axiosClient";

class DoctorDashboardService {
  async getDoctorById(doctorId) {
    const url = `/api/doctors/${doctorId}`;
    try {
      const response = await axiosClient.get(url);
      console.log(`Doctor data for doctorId ${doctorId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor:', error.response?.data || error.message);
      throw error;
    }
  }

  async getDoctorByAccountId(accountId) {
    const url = `/api/doctors/by-account/${accountId}`;
    try {
      const response = await axiosClient.get(url); // Lấy response
      console.log(`Doctor data for accountId ${accountId}:`, response.data); // Log data thực tế
      return response.data; // Trả về data thay vì response
    } catch (error) {
      console.error('Error fetching doctor by accountId:', error.response?.data || error.message);
      throw error;
    }
  }

  async getScheduleByDoctorId(doctorId) {
    const url = `/api/doctor-availability/doctor/${doctorId}/available`;
    try {
      const response = await axiosClient.get(url);
      // Nếu response.data là mảng (BE trả về array trực tiếp)
      if (Array.isArray(response.data)) return response.data;
      // Nếu BE trả về object có data là array
      if (response.data && Array.isArray(response.data.data)) return response.data.data;
      // Nếu response là array (trường hợp axios interceptor custom)
      if (Array.isArray(response)) return response;
      return [];
    } catch (error) {
      return [];
    }
  }

  async getScheduleByDoctorIdPaginated(doctorId, page = 0, size = 10) {
    const url = `/api/doctor-availability/doctor/${doctorId}/paginated?page=${page}&size=${size}`;
    try {
      const response = await axiosClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching paginated schedule:', error.response?.data || error.message);
      return { content: [], totalPages: 0, totalElements: 0, currentPage: 0 };
    }
  }

  async getAppointmentsByDoctorId(doctorId) {
    const url = `/api/appointments/doctor/${doctorId}`;
    try {
      const response = await axiosClient.get(url);
      // Nếu axiosClient có interceptor trả về data trực tiếp:
      if (Array.isArray(response)) return response;
      // Nếu không, lấy response.data
      if (Array.isArray(response.data)) return response.data;
      return [];
    } catch (error) {
      console.error('Error fetching appointments:', error.response?.data || error.message);
      throw error;
    }
  }

  async addSchedule(doctorId, data) {
    const url = `/api/doctor-availability/doctor/${doctorId}/add-slots`;
    const response = await axiosClient.post(url, {
      startTime: data.startTime,
      endTime: data.endTime,
      slotMinutes: data.slotMinutes
    });
    return response.data;
  }

  async updateSchedule(availabilityId, data) {
    const url = `/api/doctor-availability/${availabilityId}`;
    const response = await axiosClient.put(url, data);
    return response.data;
  }

  async updateAppointmentStatus(appointmentId, status) {
    const url = `/api/appointments/${appointmentId}/status?status=${status}`;
    try {
      const response = await axiosClient.put(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteSchedule(id) {
    return axiosClient.delete(`/api/doctor-availability/${id}`);
  }
  //
  async getDoctorAppointmentStats(doctorId) {
    if (!doctorId || isNaN(Number(doctorId))) {
      console.error('Invalid doctorId when calling getDoctorAppointmentStats:', doctorId);
      throw new Error('Invalid doctorId');
    }
    const url = `/api/doctor-stats/${doctorId}/appointment`;
    try {
      console.log('Gọi API thống kê với doctorId:', doctorId, 'url:', url);
      const response = await axiosClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor appointment stats:', error.response?.data || error.message);
      throw error;
    }
  }

}

export default new DoctorDashboardService();