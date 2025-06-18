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
    console.log(`Fetching schedule from: ${url}`);
    try {
      const data = await axiosClient.get(url);
      console.log(`Schedule data for doctorId ${doctorId}:`, data);
      return data;
    } catch (error) {
      console.error('Error fetching doctor schedule:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAppointmentsByDoctorId(doctorId, token) {
    const url = `/api/appointments/doctor/${doctorId}`;
    console.log(`Fetching appointments from: ${url}`);
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const data = await axiosClient.get(url, config);
      console.log(`Appointments data for doctorId ${doctorId}:`, data);
      return data;
    } catch (error) {
      console.error('Error fetching appointments:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new DoctorDashboardService();