import axiosClient from "../api/axiosClient";


class AppointmentService {

    bookAppointment(userId, appointmentData) {
        const url = '/api/appointments/book';
        return axiosClient.post(url, appointmentData, {
            headers: { userId }
        });
    }

    createPayment(userId, paymentData) {
        const url = '/api/vnpay/create-payment';
        return axiosClient.post(url, paymentData, {
            headers: { userId }
        });
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
}

export default new AppointmentService();