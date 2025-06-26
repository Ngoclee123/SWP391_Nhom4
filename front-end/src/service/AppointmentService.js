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

    // Lấy danh sách lịch hẹn dạng DTO theo doctorId
    getAppointmentsByDoctorId(doctorId, token) {
        const url = `/api/appointments/doctor/${doctorId}/dtos`;
        return axiosClient.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // Cập nhật trạng thái lịch hẹn
    updateAppointmentStatus(appointmentId, status, token) {
        const url = `/api/appointments/${appointmentId}/status`;
        return axiosClient.put(url, null, {
            params: { status }, // Gửi status qua query param
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}

export default new AppointmentService();