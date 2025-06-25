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
}

export default AppointmentService;