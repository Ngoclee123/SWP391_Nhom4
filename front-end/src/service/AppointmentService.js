<<<<<<< HEAD
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

 
    // ===== ADMIN MANAGEMENT METHODS =====
    // Lấy tất cả appointments (admin)
    getAllAppointments() {
      return axiosClient.get("/api/admin/appointments");
  }

  // Lấy appointment theo ID
  getAppointmentById(id) {
      return axiosClient.get(`/api/admin/appointments/${id}`);
  }

  // Lấy appointments theo patient ID
  getAppointmentsByPatientId(patientId) {
      return axiosClient.get(`/api/admin/appointments/patient/${patientId}`);
  }

  // Lấy appointments theo doctor ID
  getAppointmentsByDoctorId(doctorId) {
      return axiosClient.get(`/api/admin/appointments/doctor/${doctorId}`);
  }

  // Lấy appointments theo status
  getAppointmentsByStatus(status) {
      return axiosClient.get(`/api/admin/appointments/status/${status}`);
  }

  // Lấy appointments theo ngày
  getAppointmentsByDate(date) {
      return axiosClient.get(`/api/admin/appointments/date/${date}`);
  }

  // Lấy 4 lịch hẹn gần nhất (admin)
  getRecentAppointments() {
      return axiosClient.get('/api/admin/appointments/recent');
  }

  // Cập nhật appointment
  updateAppointment(id, data) {
      return axiosClient.put(`/api/admin/appointments/${id}`, data);
  }

  // Cập nhật status của appointment
  updateAppointmentStatus(id, status) {
      return axiosClient.patch(`/api/admin/appointments/${id}/status`, status);
  }

  // Xóa appointment
  deleteAppointment(id) {
      return axiosClient.delete(`/api/admin/appointments/${id}`);
  }

  // Lấy thống kê appointments
  getAppointmentStats() {
      return axiosClient.get('/api/admin/appointments/stats');
  }

    // Lấy slot hợp lệ của bác sĩ theo ngày (admin)
    getAvailableSlotsForDoctor(doctorId, date) {
      return axiosClient.get(`/api/admin/appointments/doctor/${doctorId}/slots?date=${date}`);
    }
  

}

export default new AppointmentService();
=======
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
>>>>>>> ngocle_new
