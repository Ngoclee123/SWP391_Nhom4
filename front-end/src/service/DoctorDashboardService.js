import axiosClient from "../api/axiosClient";

class DoctorDashboardService {
  async getDoctorById(doctorId) {
    const url = `/api/doctors/${doctorId}`;
    try {
      const data = await axiosClient.get(url);
      console.log(`Doctor data for doctorId ${doctorId}:`, data);
      return data;
    } catch (error) {
      console.error('Error fetching doctor:', error.response?.data || error.message);
      throw error;
    }
  }

  async getScheduleByDoctorId(doctorId) {
    const url = `/api/doctor-availability/doctor/${doctorId}/available`;
    try {
<<<<<<< Updated upstream
      const data = await axiosClient.get(url);
      console.log(`Schedule data for doctorId ${doctorId}:`, data);
      return data;
=======
      const response = await axiosClient.get(url);
      console.log("Raw response for schedule:", response);
      // Thử trả về response trực tiếp
      return response;
>>>>>>> Stashed changes
    } catch (error) {
      throw error;
    }
  }

  async getAppointmentsByDoctorId(doctorId) {
    const url = `/api/appointments/doctor/${doctorId}`;
    try {
<<<<<<< Updated upstream
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const data = await axiosClient.get(url, config);
      console.log(`Appointments data for doctorId ${doctorId}:`, data);
      return data;
=======
      const response = await axiosClient.get(url);
      // Nếu axiosClient có interceptor trả về data trực tiếp:
      if (Array.isArray(response)) return response;
      // Nếu không, lấy response.data
      if (Array.isArray(response.data)) return response.data;
      return [];
>>>>>>> Stashed changes
    } catch (error) {
      console.error('Error fetching appointments:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new DoctorDashboardService();