import axiosClient from '../api/axiosClient';

const VaccineAppointmentService = {
    getAllVaccines: (page = 0, size = 6) => axiosClient.get(`/api/vaccines?page=${page}&size=${size}`),
    getVaccine: (vaccineId) => axiosClient.get(`/api/vaccines/${vaccineId}`),
    getPatients: () => axiosClient.get('/api/parents/patients'),
    getVaccineAvailability: (vaccineId) => axiosClient.get(`/api/vaccine-appointments/availability/${vaccineId}`),
    createVaccineAppointment: (appointmentData) => {
        const request = {
            patientId: appointmentData.patientId,
            vaccineId: appointmentData.vaccineId,
            appointmentDate: appointmentData.appointmentDate,
            doseNumber: appointmentData.doseNumber || 1,
            location: appointmentData.location,
            notes: appointmentData.notes
        };
        return axiosClient.post('/api/vaccine-appointments', request)
        .then(response => {
            console.log('API response:', response);
            return response;
        })
        .catch(error => {
            console.error('API error:', error);
            throw error;
        });    
    },

    addPatient: (patientData) => {
        const request = {
            fullName: patientData.fullName,
            dateOfBirth: patientData.dateOfBirth,
            gender: patientData.gender,
            weight: patientData.weight || null,
            height: patientData.height || null,
            accountId: patientData.accountId
        };
        console.log('VaccineAppointmentService - Sending add patient request to /api/parents/patients with:', request);
        return axiosClient.post('/api/parents/patients', request);
    },


    getPaymentByVaccineAppointmentId: (vaccineAppointmentId) => axiosClient.get(`/api/vaccine-appointments/${vaccineAppointmentId}/payment`),
    createVNPayPayment: (vaccineAppointmentId, paymentData) =>
        axiosClient.post(
            `/api/vnpay/create-payment`,
            null,
            {
                params: {
                    vaccineAppointmentId,
                    paymentMethod: paymentData.method || 'BankCard',
                    bankCode: paymentData.bankCode || ''
                },
                headers: { userId: localStorage.getItem('accountId') }
            }
        ),
    createPayment: (vaccineAppointmentId, paymentData) =>
        axiosClient.post(
            '/api/vnpay/create-payment',
            null,
            {
                params: {
                    vaccineAppointmentId,
                    paymentMethod: paymentData.method || 'later',
                    bankCode: paymentData.bankCode || ''
                },
                headers: { userId: localStorage.getItem('accountId') }
            }
        ),
    requestRefund: (vaccineAppointmentId) => axiosClient.post(`/api/vaccine-appointments/${vaccineAppointmentId}/refund`),
    getHistory: (page = 0, size = 5) => axiosClient.get(`/api/vaccine-appointments/history?page=${page}&size=${size}`)
};

export default VaccineAppointmentService;