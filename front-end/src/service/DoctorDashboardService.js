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
      return response;
    } catch (error) {
      console.error('Error fetching doctor by accountId:', error.response?.data || error.message);
      throw error;
    }
  }

  async getScheduleByDoctorId(doctorId) {
    const url = `/api/doctor-availability/doctor/${doctorId}/available`;
    console.log(`Fetching schedule from: ${url}`);
    try {
      const response = await axiosClient.get(url);
      console.log(`Schedule data for doctorId ${doctorId}:`, response.data);
      return response.data;
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
      const response = await axiosClient.get(url, config);
      console.log(`Appointments data for doctorId ${doctorId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new DoctorDashboardService();