import axiosClient from "../api/axiosClient";
import UserService from "./userService";

class AppointmentService {
  async createAppointment(appointmentData) {
    try {
      console.log("Sending appointment data:", appointmentData);
      const userId = UserService.getAccountId();
      const response = await axiosClient.post(
        "/api/appointments/book",
        appointmentData,
        userId ? { headers: { userId } } : undefined
      );
      console.log("Appointment response:", response.data || response);
      return response.data || response;
    } catch (error) {
      console.error("Error in createAppointment:", error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async getAppointmentsByPatient(patientId) {
    try {
      const response = await axiosClient.get(
        `/api/appointments/patient/${patientId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error in getAppointmentsByPatient:", error);
      throw error;
    }
  }

  async cancelAppointment(appointmentId) {
    try {
      const response = await axiosClient.put(
        `/api/appointments/${appointmentId}/cancel`
      );
      return response.data;
    } catch (error) {
      console.error("Error in cancelAppointment:", error);
      throw error;
    }
  }

  async getDoctorAvailability(doctorId, date) {
    try {
      const response = await axiosClient.get(
        `/api/appointments/availability/${doctorId}?date=${date}`
      );
      return response.data;
    } catch (error) {
      console.error("Error in getDoctorAvailability:", error);
      throw error;
    }
  }

  async getDoctor(doctorId) {
    try {
      const response = await axiosClient.get(`/api/doctors/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error("Error in getDoctor:", error);
      throw error;
    }
  }

  async createPayment(paymentData) {
    try {
      const response = await axiosClient.post(
        "/api/vnpay/create-payment",
        paymentData
      );
      return response.data;
    } catch (error) {
      console.error("Error in createPayment:", error);
      throw error;
    }
  }

  async getPaymentByAppointmentId(appointmentId) {
    try {
      const response = await axiosClient.get(
        `/api/appointments/${appointmentId}/payment`
      );
      return response.data;
    } catch (error) {
      console.error("Error in getPaymentByAppointmentId:", error);
      throw error;
    }
  }
}

export default new AppointmentService();
